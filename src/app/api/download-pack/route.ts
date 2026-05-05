/**
 * Download Implementation Pack as ZIP
 *
 * Takes leadId as query param.
 * Bundles all fix engine output files into a downloadable ZIP.
 */

import { NextResponse } from "next/server";
import { getLeadByLeadId } from "@/lib/google-sheets";
import {
  readFileSync,
  existsSync,
  readdirSync,
  statSync,
} from "fs";
import { join } from "path";
import * as zlib from "zlib";

export const runtime = "nodejs";
export const maxDuration = 60;

function getOutputDir(leadId: string): string {
  return join(
    process.cwd(),
    "..",
    "..",
    "..",
    "..",
    "fix-engine",
    "output",
    leadId
  );
}

// Simple ZIP builder without external dependencies
// Creates a valid ZIP file with local file headers + central directory
function buildZip(files: { name: string; content: Buffer }[]): Buffer {
  const localHeaders: Buffer[] = [];
  const centralHeaders: Buffer[] = [];
  let offset = 0;

  const crc32Table = (() => {
    const table: number[] = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[i] = c;
    }
    return table;
  })();

  function crc32(buf: Buffer): number {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crc32Table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  for (const file of files) {
    const nameBuf = Buffer.from(file.name, "utf-8");
    const crc = crc32(file.content);
    const size = file.content.length;

    // Local file header (30 + name length + content)
    const local = Buffer.alloc(30 + nameBuf.length + size);
    local.writeUInt32LE(0x04034b50, 0); // signature
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0, 6); // flags
    local.writeUInt16LE(0, 8); // compression: stored
    local.writeUInt16LE(0, 10); // mod time
    local.writeUInt16LE(0, 12); // mod date
    local.writeUInt32LE(crc, 14); // crc32
    local.writeUInt32LE(size, 18); // compressed size
    local.writeUInt32LE(size, 22); // uncompressed size
    local.writeUInt16LE(nameBuf.length, 26); // filename length
    local.writeUInt16LE(0, 28); // extra field length
    nameBuf.copy(local, 30);
    file.content.copy(local, 30 + nameBuf.length);
    localHeaders.push(local);

    // Central directory entry (46 + name length)
    const central = Buffer.alloc(46 + nameBuf.length);
    central.writeUInt32LE(0x02014b50, 0); // signature
    central.writeUInt16LE(20, 4); // version made by
    central.writeUInt16LE(20, 6); // version needed
    central.writeUInt16LE(0, 8); // flags
    central.writeUInt16LE(0, 10); // compression
    central.writeUInt16LE(0, 12); // mod time
    central.writeUInt16LE(0, 14); // mod date
    central.writeUInt32LE(crc, 16); // crc32
    central.writeUInt32LE(size, 20); // compressed size
    central.writeUInt32LE(size, 24); // uncompressed size
    central.writeUInt16LE(nameBuf.length, 28); // filename length
    central.writeUInt16LE(0, 30); // extra field length
    central.writeUInt16LE(0, 32); // file comment length
    central.writeUInt16LE(0, 34); // disk number start
    central.writeUInt16LE(0, 36); // internal file attributes
    central.writeUInt32LE(0, 38); // external file attributes
    central.writeUInt32LE(offset, 42); // local header offset
    nameBuf.copy(central, 46);
    centralHeaders.push(central);

    offset += local.length;
  }

  // End of central directory
  const centralSize = centralHeaders.reduce((s, b) => s + b.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); // signature
  end.writeUInt16LE(0, 4); // disk number
  end.writeUInt16LE(0, 6); // disk with central dir
  end.writeUInt16LE(files.length, 8); // entries on disk
  end.writeUInt16LE(files.length, 10); // total entries
  end.writeUInt32LE(centralSize, 12); // central dir size
  end.writeUInt32LE(offset, 16); // central dir offset
  end.writeUInt16LE(0, 20); // comment length

  return Buffer.concat([...localHeaders, ...centralHeaders, end]);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId");

    if (!leadId) {
      return NextResponse.json(
        { error: "leadId is required" },
        { status: 400 }
      );
    }

    // Verify lead exists
    const lead = await getLeadByLeadId(leadId);
    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    const outputDir = getOutputDir(leadId);

    if (!existsSync(outputDir)) {
      return NextResponse.json(
        { error: "No implementation pack found. Run deliver-audit first." },
        { status: 404 }
      );
    }

    // Read all files from output directory
    const files: { name: string; content: Buffer }[] = [];
    const dirFiles = readdirSync(outputDir);

    for (const fileName of dirFiles) {
      const filePath = join(outputDir, fileName);
      if (statSync(filePath).isFile()) {
        const content = readFileSync(filePath);
        files.push({
          name: `${leadId}-${fileName}`,
          content,
        });
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Empty implementation pack" },
        { status: 404 }
      );
    }

    // Build ZIP
    const zipBuffer = buildZip(files);

    // Convert to Uint8Array for NextResponse
    const zipArray = new Uint8Array(zipBuffer);

    const businessName = lead.dealershipName || leadId;
    const zipName = `vizbiz-${businessName.toLowerCase().replace(/\s+/g, "-")}-implementation-pack.zip`;

    return new NextResponse(zipArray, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipName}"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[download-pack] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate download pack" },
      { status: 500 }
    );
  }
}

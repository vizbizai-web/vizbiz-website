import type { FixKitArtifact } from './fix-kit-generator';

function crc32(buf: Buffer): number {
  let crc = ~0;
  for (const b of buf) {
    crc ^= b;
    for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return ~crc >>> 0;
}
function u16(n: number) { const b = Buffer.alloc(2); b.writeUInt16LE(n); return b; }
function u32(n: number) { const b = Buffer.alloc(4); b.writeUInt32LE(n); return b; }
export function buildFixKitZip(artifacts: FixKitArtifact[]): Buffer {
  const files = artifacts.map(a => ({ name: a.filename, data: Buffer.from(a.content, 'utf8') }));
  const chunks: Buffer[] = []; const central: Buffer[] = []; let offset = 0;
  for (const f of files) {
    const name = Buffer.from(f.name); const crc = crc32(f.data);
    const local = Buffer.concat([u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(f.data.length), u32(f.data.length), u16(name.length), u16(0), name]);
    chunks.push(local, f.data);
    central.push(Buffer.concat([u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(f.data.length), u32(f.data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name]));
    offset += local.length + f.data.length;
  }
  const centralStart = offset; const cd = Buffer.concat(central); const end = Buffer.concat([u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(cd.length), u32(centralStart), u16(0)]);
  return Buffer.concat([...chunks, cd, end]);
}

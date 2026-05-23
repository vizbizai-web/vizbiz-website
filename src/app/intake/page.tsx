import { redirect } from "next/navigation";

export const metadata = {
  title: "VizBiz Intake | Redirecting",
  robots: {
    index: false,
    follow: true,
  },
};

export default function IntakeRedirectPage() {
  redirect("/#free-mini-report");
}

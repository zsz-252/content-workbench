import AccountDetailClient from "./AccountDetailClient";
import { DEMO_ACCOUNTS } from "@/lib/mockData";

// 静态导出所需：预定义所有账号路径
export function generateStaticParams() {
  return DEMO_ACCOUNTS.map((a) => ({ id: a.id }));
}

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AccountDetailClient accountId={id} />;
}

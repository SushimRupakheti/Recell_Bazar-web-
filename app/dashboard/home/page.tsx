import { handleGetAllItems } from "@/lib/actions/item-action";
import DashboardHomeView from "./DashboardHomeView";

export default async function DashboardHomePage() {
  const res = await handleGetAllItems();
  const anyRes = res as any;

  // normalize different possible response shapes
  let items: any[] = [];
  if (res?.success) {
    const d = res.data;
    if (Array.isArray(d)) items = d;
    else if (Array.isArray(d?.data)) items = d.data;
    else if (Array.isArray(d?.items)) items = d.items;
    else if (Array.isArray(anyRes.items)) items = anyRes.items;
    else if (Array.isArray(anyRes.data?.items)) items = anyRes.data.items;
    else if (d && typeof d === "object") {
      // try to find first array field
      const arr = Object.values(d).find((v) => Array.isArray(v));
      if (Array.isArray(arr)) items = arr as any[];
    }
  }

  return <DashboardHomeView items={items} anyRes={anyRes} />;
}
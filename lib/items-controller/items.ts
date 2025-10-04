import axios from "axios";

export type ItemPost = {
  idGroup: string;
  name: string;
  description: string;
  amount: number;
  token?: string | null;
}

const ITEMS_URL = "https://labtec.satc.edu.br/dev/baseApi/items/group/{idGroup}";

export async function getItems(idGroup: string, token?: string | null) {
  const url = ITEMS_URL.replace("{idGroup}", idGroup);
  const res = await axios.get(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res.data;
}

export async function postItems(item: ItemPost) {
  const url = ITEMS_URL.replace("{idGroup}", item.idGroup);
  const res = await axios.post(url, item, {
    headers: item.token ? { Authorization: `Bearer ${item.token}` } : undefined,
  });
  return res.data;
}

export default getItems;
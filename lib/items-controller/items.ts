import axios from "axios";

export type ApiItem = {
  idItem: string;
  name: string;
  description: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
  creator: string;
};

const ITEMS_URL = "https://labtec.satc.edu.br/dev/baseApi/items/group/{idGroup}";

export async function fetchItemsAxios(idGroup: string, token?: string | null) {
  const url = ITEMS_URL.replace("{idGroup}", idGroup);
  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
}

export default fetchItemsAxios;
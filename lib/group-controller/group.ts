import axios from "axios";

export type ApiGroup = {
  idGroup: string;
  nameGroup: string;
  ownerGroup: string;
  role: 'ADMIN' | 'USER';
};

const GROUPS_URL = "https://labtec.satc.edu.br/dev/base-api/groups";

// pegar grupos do usuário
export async function fetchGroupsAxios(token?: string | null): Promise<ApiGroup[]> {
  const res = await axios.get<ApiGroup[]>(GROUPS_URL, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
}

// criar novo grupo
export async function createGroup(name: string, token?: string | null) {
  const res = await axios.post<ApiGroup>(GROUPS_URL, {
    name
  }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
}

// pegar usuários do grupo
export async function usersInGroup(idGroup: string, token?: string | null) {
  const res = await axios.get(`${GROUPS_URL}/${idGroup}/users`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
}

// renomear grupo
export async function renameGroup(idGroup: string, newName: string, token?: string | null) {
  const res = await axios.patch(`${GROUPS_URL}/${idGroup}`, {
    name: newName
  }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
}

// convidar usuário para o grupo
export async function inviteUser(idGroup: string, email: string, role: 'admin' | 'user', token?: string | null) {
  const res = await axios.post(`${GROUPS_URL}/invite/${idGroup}`, {
    email,
    role
  }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
}

// entrar no grupo com código de convite
export async function enterGroup(idInvite: string, token?: string | null) {
  const res = await axios.post(`${GROUPS_URL}/join/${idInvite}`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
}

// alterar função do usuário
export async function alterRoleUser(idGroup: string, idUser: string, newRole: 'ADMIN' | 'USER', token?: string | null) {
  const res = await axios.patch(`${GROUPS_URL}/${idGroup}/user/${idUser}/role`, {
    role: newRole
  }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
}

export default fetchGroupsAxios;
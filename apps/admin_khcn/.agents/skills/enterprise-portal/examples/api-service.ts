import { api } from "@/services/axios";

export const getUsers = async () => {
    const res = await api.get("/users");
    return res.data;
};
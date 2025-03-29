import Role from "../models/Role.js";

export const isAdmin = async (roleId) => {
    const role = await Role.findById(roleId);
    return role.name === 'admin';
}

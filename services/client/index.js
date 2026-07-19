import clientUserModel from "../../models/client-user-model/index.js";
import "../../models/blog-model/index.js";
export const getAllClients = async () => {
  const clients = await clientUserModel
    .find()
    .select("-googleId")
    .sort({ createdAt: -1 })


  // console.log('clients with populated blogs :>> ', clients);
  return clients;
};


export const getSpecificClient = async (id) => {
  const client = await clientUserModel.findById(id).populate("blogIds");

  if (!client) {
    throw new Error("Client not found.");
  }

  return client;
};
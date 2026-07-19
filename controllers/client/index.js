import { getAllClients, getSpecificClient } from "../../services/client/index.js";


export const getAllClientsController = async (req, res, next) => {
  try {
    const clients = await getAllClients();

    res.status(200).json({
      success: true,
      message: "Clients fetched successfully.",
      data: clients,
    });
  } catch (error) {
    next(error);
  }
};


export const getSpecificClientController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await getSpecificClient(id);

    res.status(200).json({
      success: true,
      message: "Client fetched successfully.",
      data: client,
    });
  } catch (error) {
    next(error);
  }
};
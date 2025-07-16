export const chequearSiExiste = (result, nombreCampo) => {

if (result.rowCount === 0) {
    return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `${nombreCampo} no existe`
    });
}
}
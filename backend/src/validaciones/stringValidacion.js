
export const isValidString = (string, nombreCampo) => {
    if (!string || string.length < 3) {
    return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `El ${nombreCampo} debe tener al menos 3 caracteres`
    });
}
return true;
}
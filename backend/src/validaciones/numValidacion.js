
export const isPositivo = (int, nombreCampo) => {
    if (int !== undefined && int < 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: `El ${nombreCampo} no puede ser negativo`
        });
    }
return true;
}
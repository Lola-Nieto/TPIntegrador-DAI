export class validaciones {
        chequearSiExiste = async(result, nombreCampo) => {
        if (result.rowCount === 0) {
            throw new Error( `${nombreCampo} no existe`);
        }
    }
    
    isValidEmail = async(email) => {
        // Expresión regular simple para validar emails
        const re = /^[^@]+@[^@]+\.[^@]+$/;
        if (!email || typeof email !== 'string' || !re.test(email)) {
            throw new Error('El mail es inválido');
        }
        return true;
    }
    isNumValido = async(value, nombreCampo, defaultValue) => {
        if (value === undefined || value <= 0 || isNaN(value)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: `El ${nombreCampo} no es válido`
            });
        }
    return true;
    }
    
    
    isNumValido = async(string, nombreCampo) => {

        if (!string || typeof string !== 'string' || string.trim() == '' || string.length < 3) {
            throw new Error(`El campo ${nombreCampo} es inválido`);
            console.log(Error)
        };
    }

} 
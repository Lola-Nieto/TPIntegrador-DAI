

import { StatusCodes } from 'http-status-codes';

export const isValidString = (string, nombreCampo) => {
    if (!string || typeof string !== 'string' || string.trim() == '' || string.length < 3) {
        throw new Error(`El campo ${nombreCampo} es inválido`);
        console.log(Error)
    };
}
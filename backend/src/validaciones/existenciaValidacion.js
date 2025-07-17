export const chequearSiExiste = (result, nombreCampo) => {

if (result.rowCount === 0) {
    throw new Error( `${nombreCampo} no existe`);

}
}
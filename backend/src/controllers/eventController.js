import pkg from 'pg';
import { StatusCodes } from 'http-status-codes';
import config from '../../configs/db-configs.js';
import {isValidEmail} from './validaciones/mailValidacion.js'
import {isValidString} from './validaciones/stringValidacion.js'
import {chequearSiExiste} from './validaciones/existenciaValidacion.js'



const { Client } = pkg;

export const getHello = (req, res) => {
    res.json({ message: 'Hola desde la API 🚀' });
};

// 2 -Listado de eventos && 3 - Búsqueda de un Evento
export const getAllEvents = async (req, res) => {
    const { page = 1, limit = 15, name, startdate, tag } = req.query;
    const offset = (page - 1) * limit;
    const client = new Client(config);

    try {
        await client.connect();
        
        let sqlQuery = `
            SELECT 
                e.id, e.name, e.description, e.start_date, e.duration_in_minutes,
                e.price, e.enabled_for_enrollment, e.max_assistance,
                el.*, u.*
            FROM Events e
            LEFT JOIN Event_Locations el ON e.id_event_location = el.id
            LEFT JOIN Users u ON e.id_creator_user = u.id
        `; //where 1= 1 --> ?? 
        
        const values = [];
        let paramCount = 0;

        // Filtros
        if (name) {
            paramCount++;
            sqlQuery += ` AND e.name ILIKE $${paramCount}`;
            values.push(`%${name}%`);
        }

        if (startdate) {
            paramCount++;
            sqlQuery += ` AND DATE(e.start_date) = $${paramCount}`;
            values.push(startdate);
        }

        if (tag) {
            paramCount++;
            sqlQuery += ` AND EXISTS (
                SELECT 1 FROM Event_Tags et 
                JOIN Tags t ON et.id_tag = t.id 
                WHERE et.id_event = e.id AND t.name ILIKE $${paramCount}
            )`;
            values.push(`%${tag}%`);
        }

        // Contar total
        const countQuery = sqlQuery.replace(/SELECT.*FROM/, 'SELECT COUNT(*) FROM');
        const countResult = await client.query(countQuery, values);
        const total = parseInt(countResult.rows[0].count);

        // Agregar paginación
        paramCount++;
        sqlQuery += ` ORDER BY e.start_date ASC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        values.push(limit, offset);

        const result = await client.query(sqlQuery, values);

        // Si no hay eventos, responder con un mensaje adecuado
        if (result.rows.length === 0) {
            return res.status(StatusCodes.OK).json({
                collection: [],
                message: 'No hay eventos registrados en la base de datos.'
            });
        }

        // Obtener tags para cada evento
        const eventsWithTags = await Promise.all(
            result.rows.map(async (event) => {
                const tagsQuery = `
                    SELECT t.id, t.name 
                    FROM Event_Tags et 
                    JOIN Tags t ON et.id_tag = t.id 
                    WHERE et.id_event = $1
                `;
                const tagsResult = await client.query(tagsQuery, [event.id]);
                
                return {
                    id: event.id,
                    name: event.name,
                    description: event.description,
                    start_date: event.start_date,
                    duration_in_minutes: event.duration_in_minutes,
                    price: event.price,
                    enabled_for_enrollment: event.enabled_for_enrollment === '1',
                    max_assistance: event.max_assistance,
                    event_location: {
                        id: event.event_location_id,
                        name: event.location_name,
                        full_address: event.full_address,
                        latitude: parseFloat(event.latitude),
                        longitude: parseFloat(event.longitude),
                        max_capacity: event.max_capacity,
                    },
                    creator_user: {
                        id: event.creator_id,
                        username: event.username,
                        first_name: event.first_name,
                        last_name: event.last_name
                    },
                    tags: tagsResult.rows
                };
            })
        );

        /*
        location: {
                            id: event.location_id,
                            name: event.locality_name,
                            latitude: parseFloat(event.latitude),
                            longitude: parseFloat(event.longitude),
                            province: {
                                id: event.province_id,
                                name: event.province_name,
                                full_name: event.province_full_name
                            }
                        }
        */

        const nextPage = offset + limit < total ? page + 1 : null;

        res.status(StatusCodes.OK).json({
            collection: eventsWithTags,
            pagination: {
                limit: parseInt(limit),
                offset: offset,
                nextPage: nextPage,
                total: total.toString()
            }
        });

    } catch (error) {
        console.error('Error obteniendo eventos:', error);
        // Detectar error de conexión a la base de datos
        if (error.code === 'ECONNREFUSED' || error.message.includes('connect') || error.message.includes('Connection')) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Error de conexión con la base de datos'
            });
        }
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error interno del servidor'
        });
    } finally {
        await client.end();
    }
};



// 4 - Detalle de un evento
export const getEventById = async (req, res) => {
    const { id } = req.params;
    const client = new Client(config);

    try {
        await client.connect();
        
        const sqlQuery = `
            SELECT 
                e.*, el.*, l.*, p.*, u.* 
            FROM Events e
            LEFT JOIN event_Locations el ON e.id_event_location = el.id
            LEFT JOIN locations l ON el.id_location = l.id
            LEFT JOIN provinces p ON l.id_province = p.id
            LEFT JOIN users u ON e.id_creator_user = u.id
            WHERE e.id = $1
        `;
        
        const result = await client.query(sqlQuery, [id]);

        chequearSiExiste(result, "Evento");

        const event = result.rows[0];

        // Obtener tags
        const tagsQuery = `
            SELECT t.id, t.name 
            FROM Event_Tags et 
            JOIN Tags t ON et.id_tag = t.id 
            WHERE et.id_event = $1
        `;
        const tagsResult = await client.query(tagsQuery, [id]);

        // Obtener usuario creador de la ubicación
        const locationCreatorQuery = 'SELECT id, first_name, last_name, username FROM Users WHERE id = $1';
        const locationCreatorResult = await client.query(locationCreatorQuery, [event.id_creator_user]);

        const eventDetail = {
            id: event.id,
            name: event.name,
            description: event.description,
            id_event_location: event.id_event_location,
            start_date: event.start_date,
            duration_in_minutes: event.duration_in_minutes,
            price: event.price,
            enabled_for_enrollment: event.enabled_for_enrollment,
            max_assistance: event.max_assistance,
            id_creator_user: event.id_creator_user,
            event_location: {
                id: event.event_location_id,
                id_location: event.id_location,
                name: event.location_name,
                full_address: event.full_address,
                max_capacity: event.max_capacity,
                latitude: event.latitude,
                longitude: event.longitude,
                id_creator_user: event.id_creator_user,
                location: {
                    id: event.location_id,
                    name: event.locality_name,
                    id_province: event.id_province,
                    latitude: event.latitude,
                    longitude: event.longitude,
                    province: {
                        id: event.province_id,
                        name: event.province_name,
                        full_name: event.province_full_name,
                        latitude: event.province_latitude,
                        longitude: event.province_longitude,
                        display_order: event.display_order
                    }
                },
                creator_user: locationCreatorResult.rows[0]
            },
            tags: tagsResult.rows,
            creator_user: {
                id: event.creator_id,
                first_name: event.first_name,
                last_name: event.last_name,
                username: event.username,
                password: '******'
            }
        };

        res.status(StatusCodes.OK).json(eventDetail);

    } catch (error) {
        console.error('Error obteniendo evento:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error interno del servidor'
        });
    } finally {
        await client.end();
    }
};

// 6 - Crear evento
export const createEvent = async (req, res) => {
    const { 
        name, description, id_event_location, start_date, 
        duration_in_minutes, price, enabled_for_enrollment, 
        max_assistance, tags 
    } = req.body;
    const userId = req.user.id;
    const client = new Client(config);

    try {
        // Validaciones
        isValidString(name, "nombre")
        isValidString(description, "descripción")
        isPositivo(price, "precio")
        isPositivo(duration_in_minutes, "duración")

        await client.connect();

        // Verificar capacidad de la ubicación
        const locationQuery = 'SELECT max_capacity FROM Event_Locations WHERE id = $1';
        const locationResult = await client.query(locationQuery, [id_event_location]);
        
        chequearSiExiste(locationResult, "ubicación");
        //Chequear capacidad 
        if (max_assistance > locationResult.rows[0].max_capacity) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'La capacidad máxima excede la capacidad de la ubicación'
            });
        }
        //Chequear autenticación 
        if(!userId){
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Error: el usuario no se encuentra autenticado'
            });
        }
        // Insertar evento
        const insertQuery = `
            INSERT INTO Events (name, description, id_event_location, start_date, 
                              duration_in_minutes, price, enabled_for_enrollment, 
                              max_assistance, id_creator_user)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id
        `;
        
        const eventResult = await client.query(insertQuery, [
            name, description, id_event_location, start_date,
            duration_in_minutes, price, enabled_for_enrollment,
            max_assistance, userId
        ]);

        const eventId = eventResult.rows[0].id;

        /*
        // Insertar tags si se proporcionan
        if (tags && tags.length > 0) {
            for (const tagName of tags) {
                // Buscar o crear tag
                let tagQuery = 'SELECT id FROM Tags WHERE name = $1';
                let tagResult = await client.query(tagQuery, [tagName]);
                
                let tagId;
                if (tagResult.rowCount === 0) {
                    const createTagQuery = 'INSERT INTO Tags (name) VALUES ($1) RETURNING id';
                    const newTagResult = await client.query(createTagQuery, [tagName]);
                    tagId = newTagResult.rows[0].id;
                } else {
                    tagId = tagResult.rows[0].id;
                }

                // Asociar tag al evento
                const eventTagQuery = 'INSERT INTO Event_Tags (id_event, id_tag) VALUES ($1, $2)';
                await client.query(eventTagQuery, [eventId, tagId]);
            }
        }
        */

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Evento creado exitosamente',
            eventId: eventId
        });

    } catch (error) {
        console.error('Error creando evento:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error interno del servidor'
        });
    } finally {
        await client.end();
    }
};

// 6- Actualizar evento
export const updateEvent = async (req, res) => {
    const { idEvento } = req.params;
    const updateData = req.body;
    const userId = req.user.id;
    const client = new Client(config);
    //FechaInicio y enrollment, asist máx, ubicación, categoría no deberían estar tmb
    //
    try {
        await client.connect();

        // Verificar que el evento existe y pertenece al usuario
        const checkQuery = 'SELECT id_creator_user FROM Events WHERE id = $1';
        const checkResult = await client.query(checkQuery, [idEvento]);

        chequearSiExiste(checkResult, "Evento")

        //Chequear autenticación 
        if (checkResult.rows[0].id_creator_user !== userId) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'No tienes permisos para editar este evento'
            });
        }

        // Validaciones similares a createEvent

        //ERROR: Asume que se envía un precio, duración, nombre y descripción a actualizar
        isValidString(updateData.name,"nombre")
        isValidString(updateData.description,"descripción")

        isPositivo(updateData.price,"precio")
        isPositivo(updateData.duration_in_minutes,"duración")

        // Construir query de actualización dinámicamente
        const updateFields = [];
        const values = [];
        let paramCount = 0;

        Object.keys(updateData).forEach(key => {
            if (key !== 'id' && key !== 'id_creator_user' && key !== 'tags') {
                paramCount++;
                updateFields.push(`${key} = $${paramCount}`);
                values.push(updateData[key]);
            }
        });
        if (updateFields.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'No hay campos válidos para actualizar'
            });
        }

        paramCount++;
        values.push(idEvento);
        //values.push(idEvento);

        const updateQuery = `UPDATE Events SET ${updateFields.join(', ')} WHERE id = $${paramCount}`;
        await client.query(updateQuery, values);

        /*
        // Actualizar tags si se proporcionan
        if (updateData.tags) {
            // Eliminar tags existentes
            await client.query('DELETE FROM Event_Tags WHERE id_event = $1', [id]);

            // Insertar nuevos tags
            for (const tagName of updateData.tags) {
                let tagQuery = 'SELECT id FROM Tags WHERE name = $1';
                let tagResult = await client.query(tagQuery, [tagName]);
                
                let tagId;
                if (tagResult.rowCount === 0) {
                    const createTagQuery = 'INSERT INTO Tags (name) VALUES ($1) RETURNING id';
                    const newTagResult = await client.query(createTagQuery, [tagName]);
                    tagId = newTagResult.rows[0].id;
                } else {
                    tagId = tagResult.rows[0].id;
                }

                const eventTagQuery = 'INSERT INTO Event_Tags (id_event, id_tag) VALUES ($1, $2)';
                await client.query(eventTagQuery, [id, tagId]);
            }
        }

        */

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Evento actualizado exitosamente'
        });

    } catch (error) {
        console.error('Error actualizando evento:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error interno del servidor'
        });
    } finally {
        await client.end();
    }
};

// 6- Eliminar evento
export const deleteEvent = async (req, res) => {
    const { idEvento } = req.params;
    const userId = req.user.id;
    const client = new Client(config);

    try {
        await client.connect();

        // Verificar que el evento existe y pertenece al usuario
        const checkQuery = 'SELECT id_creator_user FROM Events WHERE id = $1';
        const checkResult = await client.query(checkQuery, [id]);
        
        //Chequear autenticación
        if(!userId){
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Error: el usuario no se encuentra autenticado'
            });
        }

        chequearSiExiste(checkResult, "Evento")
        //Chequear autenticación
        if (checkResult.rows[0].id_creator_user !== userId) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'No tienes permisos para eliminar este evento'
            });
        }
        
        // Verificar si hay usuarios registrados
        const enrollmentQuery = 'SELECT COUNT(*) FROM Event_Enrollments WHERE id_event = $1';
        const enrollmentResult = await client.query(enrollmentQuery, [idEvento]);

        if (parseInt(enrollmentResult.rows[0].count) > 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'No se puede eliminar un evento con usuarios registrados'
            });
        }

        // Eliminar tags del evento
        await client.query('DELETE FROM Event_Tags WHERE id_event = $1', [idEvento]);

        // Eliminar evento
        await client.query('DELETE FROM Events WHERE id = $1', [idEvento]);

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Evento eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error eliminando evento:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error interno del servidor'
        });
    } finally {
        await client.end();
    }
};

// 7- Inscribirse a un evento
export const enrollInEvent = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const client = new Client(config);

    try {
        await client.connect();

        // Verificar que el evento existe
        const eventQuery = `
            SELECT start_date, enabled_for_enrollment, max_assistance 
            FROM Events WHERE id = $1
        `;
        const eventResult = await client.query(eventQuery, [id]);

        if (eventResult.rowCount === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        const event = eventResult.rows[0];

        // Verificar si está habilitado para inscripción
        if (event.enabled_for_enrollment !== '1') {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'El evento no está habilitado para inscripción'
            });
        }

        // Verificar fecha del evento
        const eventDate = new Date(event.start_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (eventDate <= today) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'No se puede inscribir a un evento que ya pasó o es hoy'
            });
        }

        // Verificar si ya está inscrito
        const existingEnrollmentQuery = 'SELECT id FROM Event_Enrollments WHERE id_event = $1 AND id_user = $2';
        const existingEnrollmentResult = await client.query(existingEnrollmentQuery, [id, userId]);

        if (existingEnrollmentResult.rowCount > 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Ya estás inscrito en este evento'
            });
        }

        // Verificar capacidad
        const currentEnrollmentsQuery = 'SELECT COUNT(*) FROM Event_Enrollments WHERE id_event = $1';
        const currentEnrollmentsResult = await client.query(currentEnrollmentsQuery, [id]);
        const currentEnrollments = parseInt(currentEnrollmentsResult.rows[0].count);

        if (currentEnrollments >= event.max_assistance) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'El evento ha alcanzado su capacidad máxima'
            });
        }

        // Inscribir al usuario
        const enrollmentQuery = `
            INSERT INTO Event_Enrollments (id_event, id_user, registration_date_time)
            VALUES ($1, $2, NOW())
        `;
        await client.query(enrollmentQuery, [id, userId]);

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Inscripción exitosa'
        });

    } catch (error) {
        console.error('Error en inscripción:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error interno del servidor'
        });
    } finally {
        await client.end();
    }
};

// Cancelar inscripción a un evento
export const cancelEnrollment = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const client = new Client(config);

    try {
        await client.connect();

        // Verificar que el evento existe
        const eventQuery = 'SELECT start_date FROM Events WHERE id = $1';
        const eventResult = await client.query(eventQuery, [id]);

        if (eventResult.rowCount === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        const event = eventResult.rows[0];

        // Verificar fecha del evento
        const eventDate = new Date(event.start_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (eventDate <= today) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'No se puede cancelar la inscripción a un evento que ya pasó o es hoy'
            });
        }

        // Verificar si está inscrito
        const enrollmentQuery = 'SELECT id FROM Event_Enrollments WHERE id_event = $1 AND id_user = $2';
        const enrollmentResult = await client.query(enrollmentQuery, [id, userId]);

        if (enrollmentResult.rowCount === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'No estás inscrito en este evento'
            });
        }

        // Cancelar inscripción
        await client.query('DELETE FROM Event_Enrollments WHERE id_event = $1 AND id_user = $2', [id, userId]);

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Inscripción cancelada exitosamente'
        });

    } catch (error) {
        console.error('Error cancelando inscripción:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error interno del servidor'
        });
    } finally {
        await client.end();
    }
};

// Obtener participantes de un evento
export const getEventParticipants = async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 15 } = req.query;
    const offset = (page - 1) * limit;
    const client = new Client(config);

    try {
        await client.connect();

        // Verificar que el evento existe
        const eventQuery = 'SELECT id FROM Events WHERE id = $1';
        const eventResult = await client.query(eventQuery, [id]);

        if (eventResult.rowCount === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        // Contar total de participantes
        const countQuery = 'SELECT COUNT(*) FROM Event_Enrollments WHERE id_event = $1';
        const countResult = await client.query(countQuery, [id]);
        const total = parseInt(countResult.rows[0].count);

        // Obtener participantes con paginación
        const participantsQuery = `
            SELECT 
                u.id, u.username, u.first_name, u.last_name,
                ee.attended, ee.rating, ee.description
            FROM Event_Enrollments ee
            JOIN Users u ON ee.id_user = u.id
            WHERE ee.id_event = $1
            ORDER BY ee.registration_date_time ASC
            LIMIT $2 OFFSET $3
        `;
        const participantsResult = await client.query(participantsQuery, [id, limit, offset]);

        const participants = participantsResult.rows.map(row => ({
            user: {
                id: row.id,
                username: row.username,
                first_name: row.first_name,
                last_name: row.last_name
            },
            attended: row.attended,
            rating: row.rating,
            description: row.description
        }));

        const nextPage = offset + limit < total ? page + 1 : null;

        res.status(StatusCodes.OK).json({
            collection: participants,
            pagination: {
                limit: parseInt(limit),
                offset: offset,
                nextPage: nextPage,
                total: total.toString()
            }
        });

    } catch (error) {
        console.error('Error obteniendo participantes:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error interno del servidor'
        });
    } finally {
        await client.end();
    }
};

// Mantener las funciones existentes para compatibilidad
export const getEventByName = async (req, res) => {
    const { name } = req.params;
    const client = new Client(config);

    try {
        await client.connect();
        const sqlQuery = 'SELECT * FROM Events WHERE name = $1';
        const values = [name];
        const resultadoPg = await client.query(sqlQuery, values);
        
        if (resultadoPg.rowCount === 0) {
            return res.status(StatusCodes.NOT_FOUND).send(`No se encontró un evento con el nombre ${name}`);
        }
        res.status(StatusCodes.OK).json(resultadoPg.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error interno del servidor');
    } finally {
        await client.end();
    }
};

export const getEventByStartDate = async (req, res) => {
    const { startdate } = req.params;
    const client = new Client(config);

    try {
        await client.connect();
        const sqlQuery = 'SELECT * FROM Events WHERE startdate = $1';
        const values = [startdate];
        const resultadoPg = await client.query(sqlQuery, values);
        
        if (resultadoPg.rowCount === 0) {
            return res.status(StatusCodes.NOT_FOUND).send(`No se encontró un evento con fecha de inicio ${startdate}`);
        }
        res.status(StatusCodes.OK).json(resultadoPg.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error interno del servidor');
    } finally {
        await client.end();
    }
};

export const getEventByTag = async (req, res) => {
    const { tag } = req.params;
    const client = new Client(config);

    try {
        await client.connect();
        const sqlQuery = 'SELECT * FROM Events WHERE tag = $1';
        const values = [tag];
        const resultadoPg = await client.query(sqlQuery, values);
        
        if (resultadoPg.rowCount === 0) {
            return res.status(StatusCodes.NOT_FOUND).send(`No se encontró un evento con la etiqueta ${tag}`);
        }
        res.status(StatusCodes.OK).json(resultadoPg.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error interno del servidor');
    } finally {
        await client.end();
    }
};
  
const dbhelper = require("../configs/dbhelper");
const {
    createCredTable,
    findCredQuery,
    addQuery,
    findIfExistsQuery,
    getCredsWithEmailQuery,
    countLabTechQuery,
    updatePassQuery,
    getAllQuery,
    findLabTechByIdQuery,
    updateLabTechByIdQuery,
} = require("../configs/queries/labTechnologist");

const getAllLabTechs = () => {
    return dbhelper.query(getAllQuery).then((result) => {
        return result;
    });
};

const createTables = () => {
    return dbhelper.query(createCredTable, []).then((result) => {
        console.log(result, "in db helper: Lab Tech Table Created");
        return result;
    });
};

const findCred = (ID) => {
    console.log("id received:", ID);
    return dbhelper.query(findCredQuery, [ID]).then((result) => {
        return result;
    });
};

const updatePass = (password, id) => {
    return dbhelper.query(updatePassQuery, [password, id]).then((result) => {
        return result;
    });
};

const getLabTechCredsFromEmail = (email) => {
    console.log("email received:", email);
    return dbhelper.query(getCredsWithEmailQuery, [email]).then((result) => {
        return result;
    });
};

const countLabTech = () => {
    return dbhelper.query(countLabTechQuery, []).then((result) => {
        return result[0];
    });
};

const findIfExists = (email) => {
    console.log("email received to db:", email);
    return dbhelper.query(findIfExistsQuery, [email]).then((result) => {
        return result;
    });
};

const addLabTech = (labTech) => {
    console.log("lab tech received:", labTech);
    const values = [
        labTech.id,
        labTech.name,
        labTech.phonenum || labTech.phoneNum || 0,
        labTech.email,
        labTech.age || 0,
        labTech.gender || 'M',
        labTech.dob || labTech.DOB,
        labTech.address || 'AASTU'
    ];
    return dbhelper.query(addQuery, values).then((result) => {
        console.log("lab tech added successfully");
        return result;
    });
};

const findById = (id) => {
    return dbhelper.query(findLabTechByIdQuery, [id]).then((result) => {
        return result;
    });
};

const updateLabTechById = (id, labTech) => {
     const values = [
        id,
        labTech.name,
        labTech.phoneNum || labTech.phonenum,
        labTech.email,
        labTech.age,
        labTech.gender,
        labTech.DOB || labTech.dob,
        labTech.address
    ];
    return dbhelper.query(updateLabTechByIdQuery, values).then((result) => {
        return result[0];
    });
};

module.exports = {
    findIfExists,
    createTables,
    findCred,
    addLabTech,
    getLabTechCredsFromEmail,
    countLabTech,
    updatePass,
    getAllLabTechs,
    findById,
    updateLabTechById,
};

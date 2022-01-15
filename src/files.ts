// import {promises as fsPromises} from 'node:fs';
const fsPromises = require("fs").promises;

export async function loadString(path: string): Promise<string> {
    try {
        // https://nodejs.org/api/fs.html
        const file = await fsPromises.open(path, "r");
        const buffer = await file.readFile();
        // console.log(fileData, fileData.toJSON(), fileData.toString());
        // fileData.
        file.close();
        // const buffer = fileData.buffer.slice(0, fileData.bytesRead);
        return buffer.toString();
    }
    catch (err) {
        console.warn(err);
        throw `Failed to load: ${path}`;
    }
}


export async function loadJSON(path: string) {
    return JSON.parse(await loadString(path));
}


export async function saveJSON(object: any, path: string, indent = 0) {
    try {
        // https://nodejs.org/api/fs.html
        const file = await fsPromises.open(path, "w");
        file.write(JSON.stringify(object, null, indent));
        file.close();
    }
    catch (err) {
        const errorStr = `Failed to write to: ${path}`;
        console.warn(errorStr, err);
        throw errorStr;
    }
}

export async function saveFile(fileContent: any, path: string) {
    try {
        // https://nodejs.org/api/fs.html
        const file = await fsPromises.open(path, "w");
        file.write(fileContent);
        file.close();
    }
    catch (err) {
        const errorStr = `Failed to write to: ${path}`;
        console.warn(errorStr, err);
        throw errorStr;
    }
}

const path = require('path');

export async function ls(dirPath: string) {

    console.log("ls", dirPath);

    try {
        const filenames = await fsPromises.readdir(dirPath);
        console.log({filenames});
        return filenames;

        // const isDir = async (p: string) => {
        //     try {
        //         await fsPromises.readFile(p);
        //         return true;
        //     } catch(err) {
        //         return false;
        //     }
        // }

        // const response_object = await Promise.all(filenames.map(async (x) => {
        //     r = await isDir(path.join(full_path, x));
        //     return {
        //         name: x,
        //         dir: after_drive,
        //         type: r
        //     }
        // }));
    }
    catch (error) {
        console.log(error);
        // const path_elements = full_path.split(path.sep);
        // const filename = path_elements[path_elements.length - 1];
        // res.status(400).send(`Unable to open file ${filename}`);
        return [];
    }
}

// const dirRenderer = (RootDir, renderer) => {

//     console.log(req.baseUrl);
//     console.log(RootDir);
//     console.log(req.originalUrl.split("/"));

//     const path_arr = req.originalUrl.split("/");
//     const after_drive = path.join(...path_arr.slice(2));
//     const relative_path = path.join("../../drive/", after_drive);
//     const full_path = path.join(RootDir, relative_path);
//     console.log(1, full_path);

//     if (path_arr.length < 3 || path_arr[1] !== "drive") {
//         res.status(400).send(`Unable to open file ${req.originalUrl}`);
//     } else {

//         fs.readFile(full_path).then(fileContent => {

//             console.log(fileContent.toString());
//             res.status(200).send(fileContent.toString());

//         }).catch(error => {
//             handleDirectory(res, full_path, after_drive);
//         });
//     }

// }

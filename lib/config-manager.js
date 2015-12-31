"use babel";

import fs from "fs";

let oConfigManager,
    fBackup,
    fRestore,
    fHasConfigBackup,
    fGetLocalConfigFile,
    sConfigPath = atom.config.getUserConfigPath(),
    sConfigBackupPath = `${ sConfigPath }.bck`;

fBackup = function() {
    return fs.writeFileSync( `${ atom.config.getUserConfigPath() }.bck`, fs.readFileSync( atom.config.getUserConfigPath() ) );
};

fRestore = function() {
    return !( fs.writeFileSync( sConfigPath, fs.readFileSync( sConfigBackupPath ) ) ) && fs.unlinkSync( sConfigBackupPath );
};

fHasConfigBackup = function() {
    return fs.existsSync( sConfigBackupPath );
};

fGetLocalConfigFile = function( aPaths ) {
    for ( let sPath of aPaths ) {
        for ( let sProjectPath of atom.project.getPaths() ) {
            let sFoundedPath;

            if ( fs.existsSync( sFoundedPath = `${ sProjectPath }/${ sPath }` ) ) {
                return sPath;
            }
        }
    }
    return false;
};

oConfigManager = {
    "backup": fBackup,
    "restore": fRestore,
    "hasConfigBackup": fHasConfigBackup,
    "getLocalConfigFile": fGetLocalConfigFile
};

export default oConfigManager;

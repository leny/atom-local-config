fs = require "fs"

module.exports =

    backup: ( fNext ) ->
        fs.writeFileSync "#{ atom.config.getUserConfigPath() }.bck", fs.readFileSync atom.config.getUserConfigPath()

    restore: ( fNext ) ->
        !( fs.writeFileSync atom.config.getUserConfigPath(), fs.readFileSync "#{ atom.config.getUserConfigPath() }.bck" ) and fs.unlinkSync "#{ atom.config.getUserConfigPath() }.bck"

    hasConfigBackup: ->
        fs.existsSync "#{ atom.config.getUserConfigPath() }.bck"

    getLocalConfigFile: ( aPaths ) -> # returns string or false
        for sConfigPath in aPaths
            for sProjectPath in atom.project.getPaths()
                return sPath if fs.existsSync sPath = "#{ sProjectPath }/#{ sConfigPath }"
        no

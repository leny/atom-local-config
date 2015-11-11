ConfigManager = require "./config-manager"
{ CompositeDisposable } = require "atom"
CSON = require "cson-parser"
path = require "path"
fs = require "fs"

module.exports =
    config:
        "applyOnActivation":
            type: "boolean"
            default: false
            title: "Auto apply"
            description: "If a local config file is found when project is loaded, it will be applied."
        "configFilePaths":
            type: "array"
            title: "Local config file path"
            description: "Array of paths to lookup in project for local config file."
            default: [ ".atom", ".atom.cson", "atom.cson", ".config.cson", "config.cson", "atom-config.cson" ]
            items:
                type: "string"

    subscriptions: null

    activate: ->
        if ConfigManager.hasConfigBackup()
            ConfigManager.restore()
            atom.config.load()

        @subscriptions = new CompositeDisposable
        @subscriptions.add atom.commands.add "atom-workspace",
            "local-config:apply-local-config": => @applyLocalConfig no
            "local-config:restore-config": => @restoreConfig()

        @applyLocalConfig() if atom.config.get "local-config.applyOnActivation"

    deactivate: ->
        @subscriptions.dispose()

        @restoreConfig()

    applyLocalConfig: ( bSilent = yes ) ->
        unless sConfigFilePath = ConfigManager.getLocalConfigFile atom.config.get "local-config.configFilePaths"
            unless bSilent
                atom.notifications.addWarning "No local config file found.",
                    detail: "You can change the possible paths to lookup inside package's settings."
                    dismissable: yes
        ConfigManager.restore() if ConfigManager.hasConfigBackup()
        ConfigManager.backup()
        try
            sLocalConfigContent = fs.readFileSync sConfigFilePath, "utf-8"
            oLocalConfig = CSON.parse sLocalConfigContent
        catch oError
            console.error oError
            atom.notifications.addError "Failed to load `#{ sConfigFilePath }`",
                detail: oError.message
                dismissable: yes
        if oLocalConfig.global?
            oLocalConfig[ "*" ] = oLocalConfig.global
            delete oLocalConfig.global
        for sScopeSelector, oScopedConfig of oLocalConfig
            oOptions = {}
            oOptions[ "scopeSelector" ] = sScopeSelector if sScopeSelector isnt "*"
            for sPackage, oPackageConfig of oScopedConfig
                for sKey, mValue of oPackageConfig
                    sKeyPath = "#{ sPackage }.#{ sKey }"
                    atom.config.set sKeyPath, mValue, oOptions

    restoreConfig: ->
        if ConfigManager.hasConfigBackup()
            ConfigManager.restore()
            atom.config.load()

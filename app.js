{
    //#region "version": "0.2.0",
    "configurations" [
        {
            "name": "Attach to Chrome",
            "port": 9222,
            "request": "attach",
            "type": "chrome",
            "webRoot": "${workspaceFolder}"
        },
        {
            "name": "Launch",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/server.js", // Update with your main server file
            "runtimeExecutable": "node",
            "skipFiles": ["<node_internals>/**"],
            "env": {
                "NODE_ENV": "development"
            },
            "console": "integratedTerminal"
        }
    ]
}

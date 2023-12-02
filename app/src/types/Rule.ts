export interface Rule {
    "actions": [
        {
            "address": "string",
            "body": {
                "on": "true"
            },
            "method": "POST"
        }
    ],
    "conditions": [
        {
            "address": "string",
            "operator": "eq",
            "value": "string"
        }
    ],
    "name": "string"
}
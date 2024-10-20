module.exports = {
    privGroups: [
        {
            id: "USERS",
            name: "User Permissions"
        },
        {
            id: "ROLES",
            name: "Role Permissions"
        },
        {
            id: "CATEGORIES",
            name: "Category Permissions"
        },
        {
            id: "AUDITLOGS",
            name: "AuditLogs Permissions"
        }
    ],

    privileges: [
        // User Permissions
        {
            key: "user_view",
            name: "User View",
            group: "USERS",
            description: "User view"
        },
        {
            key: "user_add",
            name: "User Add",
            group: "USERS",
            description: "User add"
        },
        {
            key: "user_update",
            name: "User Update",
            group: "USERS",
            description: "User update"
        },
        {
            key: "user_delete",
            name: "User Delete",
            group: "USERS",
            description: "User delete"
        },

        // Role Permissions
        {
            key: "role_view",
            name: "Role View",
            group: "ROLES",
            description: "Role view"
        },
        {
            key: "role_add",
            name: "Role Add",
            group: "ROLES",
            description: "Role add"
        },
        {
            key: "role_update",
            name: "Role Update",
            group: "ROLES",
            description: "Role update"
        },
        {
            key: "role_delete",
            name: "Role Delete",
            group: "ROLES",
            description: "Role delete"
        },

        // Category Permissions
        {
            key: "category_view",
            name: "Category View",
            group: "CATEGORIES",
            description: "Category view"
        },
        {
            key: "category_add",
            name: "Category Add",
            group: "CATEGORIES",
            description: "Category add"
        },
        {
            key: "category_update",
            name: "Category Update",
            group: "CATEGORIES",
            description: "Category update"
        },
        {
            key: "category_delete",
            name: "Category Delete",
            group: "CATEGORIES",
            description: "Category delete"
        },

        // AuditLogs Permissions
        {
            key: "auditlog_view",
            name: "AuditLog View",
            group: "AUDITLOGS",
            description: "AuditLog view"
        }
    ]
};

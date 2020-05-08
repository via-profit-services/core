export declare enum Role {
    ADMIN = "admin",
    DEVELOPER = "developer"
}
export declare const isAuthenticated: import("graphql-shield/dist/rules").Rule;
export declare const isAdmin: import("graphql-shield/dist/rules").Rule;
export declare const isOwner: import("graphql-shield/dist/rules").Rule;
export declare const isDeveloper: import("graphql-shield/dist/rules").Rule;

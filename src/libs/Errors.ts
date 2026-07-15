export enum HttpCode{
    OK = 200,
    CREATED = 201,
    NOT_MODIFIED = 400,
    BAD_REQUEST = 400,
    UNATHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}

export enum Message{
    SOMETHING_WENT_RONG = "Something Went Wrong!",
    NO_DATA_FOUND = "No data is found!",
    CREATE_FAILED = "Create is failed!",
    UPDATE_FAILED = "Update is fauled!",
    EXISTING_USER = "You are already registered!",
    NO_MEMBER_NICK = "No memeber with that member nick!",
    WRONG_PASSWORD = "Wrong password inserted!",
    NOT_AUTHENTICATED = "You are not authenticated, Please login first",
    BLOCKED_USER = "You have been blocked, contact admin!",
    TOKEN_CREATION_FAILED = "Token creation error!",
}

class Errors extends Error{
    public code: HttpCode;
    public message: Message;

    static standard = {
        code: HttpCode.INTERNAL_SERVER_ERROR,
        message: Message.SOMETHING_WENT_RONG,
    }

    constructor(statusCode: HttpCode, statusMessage: Message){
        super();
        this.code = statusCode;
        this.message = statusMessage;
    }

}

export default Errors;
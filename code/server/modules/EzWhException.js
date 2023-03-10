class EzWhException {
  static TableAlreadyExists = "ERROR: Table already exists";
  static InternalError = "ERROR: Internal server error";
  static NotFound = "ERROR: Not Found";
  static PositionFull = "ERROR: Position cannot contain all the requested items";
  static Unauthorized = "ERROR: User not authorized";
  static EntryNotAllowed = "ERROR: Unprocessable Entity";
  static Conflict = "ERROR: conflict in DB";
}

module.exports = EzWhException;

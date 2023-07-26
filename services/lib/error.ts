export const enum ErrorType {
  // JWT
  TokenError = 'TokenError',
  AccessError = 'AccessError',
  // Grunt
  OrganizationPermissionError = 'OrganizationPermissionError',
  FeaturePermissionError = 'FeaturePermissionError',
  IdentityTypeError = 'IdentityTypeError',
  UserTypeError = 'UserTypeError',
  ProjectPermissionError = 'ProjectPermissionError',
  PrivilegeError = 'PrivilegeError',
  // CRUD
  EntityNotFound = 'EntityNotFound',
  EntitiyConflict = 'EntityConflict',
  EntitiyRelationConflict = 'EntityRelationConflict',

  // ELASTIC
  ElasticPermissionError = 'ElasticPermissionError',
  ElasticImplementationError = 'ElasticImplementationError',
  ElasticMaintenanceError = 'ElasticMaintenanceError',

  // AUTH
  EmployeeDeactivated = 'EmployeeDeactivated',
  OrganizationExpired = 'OrganizationExpired',

  ScreenshotsNotEnabled = 'ScreenshotsNotEnabled',
  ScreenshotsIgnoredForApp = 'ScreenshotsIgnoredForApp',

  EmployeeAlreadyDeactivated = 'EmployeeAlreadyDeactivated',
  EmployeeAlreadyActivated = 'EmployeeAlreadyActivated',

  LocationExistsByIp = 'LocationExistsByIp',
  LocationExistsByMac = 'LocationExistsByMac',
  CsvDuplicateLocationNames = 'CsvDuplicateLocationNames',
  CsvDuplicateLocationIps = 'CsvDuplicateLocationIps',
  CsvDuplicateLocationMacs = 'CsvDuplicateLocationMacs',

  DwError = 'DataWarehouseError',
}

export interface IErrorResponse {
  type: string;
  message: string;
  details?: any;
}

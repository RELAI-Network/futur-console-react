function customHttpError(e, { errors, statusCode } = {}) {
  if (statusCode)
    return new Error(_customHttpMessage(statusCode, errors), {
      code: statusCode,
    });

  const eMessage = e?.message ?? "Une erreur inconnue s'est produite. Réessayez plus tard.";
  if (eMessage === 'Network Error') {
    return new Error('Vérifiez votre connexion Internet.');
  }
  
  // eslint-disable-next-line
  for (let i = 0; i < Object.entries(_httpMessagesErrors).length; i++) {
    const [code, message] = Object.entries(_httpMessagesErrors)[i];
    if (eMessage.includes(`code ${code}`) || eMessage.includes(`error ${code}`)) {
      return new Error(errors?.[code] ?? message);
    }
  }

  return new Error(eMessage);
}

export default customHttpError;

const BAD_REQUEST_ERROR =
  "Impossible d'effectuer cette action. Vérifiez à nouveau les données du formulaire.";

const PAYMENT_REQUIRED = 'Paiement requis.';

const UNPROCESSABLE_ENTITY_ERROR =
  'Veuillez remplir le formulaire suivant les indications données.';

const MISSING_ABILITY_ERROR =
  "Vous n'avez pas les autorisations nécessaires pour effectuer cette action.";

const RESOURCE_NOT_FOUND_ERROR = 'Ressource introuvable.';

const HTTP_REQUEST_ENTITY_TOO_LARGE =
  'La taille de votre requête excède celle autorisée par le serveur.';

const HTTP_METHOD_UNAUTHORIZED_ERROR = "Cette action n'est pas autorisée.";

const HTTP_TOO_MANY_REQUESTS = 'Vous avez effectué un trop grand nombre de requêtes simultanément.';

const SERVER_ERROR = "Une erreur inconnue s'est produite. \nRéessayez plus tard.";

const _httpMessagesErrors = {
  400: BAD_REQUEST_ERROR,
  401: MISSING_ABILITY_ERROR,
  402: PAYMENT_REQUIRED,
  403: MISSING_ABILITY_ERROR,
  404: RESOURCE_NOT_FOUND_ERROR,
  405: HTTP_METHOD_UNAUTHORIZED_ERROR,
  413: HTTP_REQUEST_ENTITY_TOO_LARGE,
  422: UNPROCESSABLE_ENTITY_ERROR,
  429: HTTP_TOO_MANY_REQUESTS,
  500: SERVER_ERROR,
};

function _customHttpMessage(statusCode, customErrors) {
  return customErrors?.[statusCode] ?? _httpMessagesErrors?.[statusCode];
}

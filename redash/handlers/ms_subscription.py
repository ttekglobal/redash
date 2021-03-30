
import logging

from redash.handlers import routes
from redash.handlers.base import json_response, org_scoped_rule
from flask import request, make_response
from redash.utils import json_dumps

logger = logging.getLogger(__name__)
@routes.route(org_scoped_rule("/subscriptioncallback"), methods=["POST"])
def subscriptionCallback():
    try:
        token = request.args.get('validationToken')
        data = json_dumps({"validationToken": token})
        headers = {"Content-Type": "text/plain"}
        return make_response(token, 200, headers)
    except:
        logger.error('ERROR')

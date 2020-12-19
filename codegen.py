#!/usr/bin/env python3
import sys
import yaml
import os
import re
import requests

class NoAliasDumper(yaml.Dumper):
    def ignore_aliases(self, data):
        return True

def remove_oneof(data):
    """ Removes oneOf key from a dict and recursively calls this
        function on other dict values.
    """
    if 'oneOf' in data:
        del data['oneOf']
    for key in data:
        if isinstance(data[key], dict):
            remove_oneof(data[key])
    return data

filepath = sys.argv[1]
if not os.path.exists(filepath):
        response = requests.get("https://www.tatorapp.com/schema")
        assert response.status_code == 200
        with open(filepath, 'wb') as f:
            f.write(response.content)
with open(filepath, 'r') as f:
    schema = yaml.load(f, Loader=yaml.FullLoader)
    schema = remove_oneof(schema)
with open(filepath, 'w') as f:
    yaml.dump(schema, f, Dumper=NoAliasDumper)

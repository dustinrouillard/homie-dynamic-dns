# Homie Dynamic DNS

So I had a domain laying around `homie.sh`, and the homies wanted a domain, so I decided to make use of it.

This is a cloudflare worker powered ddns provider.

## Authentication

Authentication is handled through discord oauth and has a configuration option, if you set `DISCORD_ROLE_ID` it will only allow users with that role in `DISCORD_GUILD_ID` to login, this will require a `DISCORD_TOKEN` of a bot user in the guild so that it can properly check if they have the role.

If you specify only the token and guild id without the role id it will allow anyone in the guild to login.

## Environment Variables

These are the required variables to be set on the worker side.

```bash
CLOUDFLARE_API_KEY - Must be an API key with valid access to the zone
CLOUDFLARE_ZONE_ID - Put the zone id that you intend dns to controlled for
DISCORD_CLIENT_ID - Discord OAuth client id
DISCORD_CLIENT_SECRET - Discord OAuth client secret
DISCORD_REDIRECT_URI - Discord OAuth redirect uri
DISCORD_TOKEN - Discord bot token (optional, read Authentication section)
DISCORD_ROLE_ID - Discord role ID (optional, read Authentication section)
DISCORD_GUILD_ID - Discord guild ID (optional, read Authentication section)
```

And if you're going to be using the ddclient setup in `/ddclient` these are the following environment variables needed for functionality.

```bash
DDCLIENT_CONF_VERBOSE - Enables verbose logging in ddclient (Default: true)
DDCLIENT_CONF_DAEMON - How often does the daemon check for updates (Default: 1800)
DDCLIENT_CONF_SSL - Control if ssl is configured to the dns server (Default: yes)
HOMIE_RECORD_ID - Record ID of the record to keep updated
HOMIE_ACCESS_TOKEN - Token returned from `POST /token`
HOMIE_RECORD_NAME - Record name (Must match the name on record under ID to handle updating properly)
```

## Routes

### **GET** `/authenticate` - Returns the OAuth URL (Discord OAuth)

### **POST** `/authenticate` - Logs you into your account (takes the ?code query)

### **POST** `/create` - Create a new DNS record entry

```json
{
  "type": "A",
  "name": "dustin",
  "content": "1.2.3.4"
}
```

This will respond with the record ID which you can use in the `HOMIE_RECORD_ID` environment variable when using the ddclient configuration.

### **GET** `/list` - Returns the list of dns records owned by your account

### **GET** `/user` - Returns the user account you're logged in with

### **POST** `/token` - Generates or Re-generates your access token (used for dynamic updates)

### **GET** `/nic/update` - Specifc to ddclient for updating the record (supports the changeip protocol in ddclient, the record and access token are passed as a username and password)

### **GET** `/records/:id` - Returns details about the dns record if owned by you

### **POST** `/records/:id` - Another dynamic update, this one is based off your connecting IP and the record id is in the url path

### **PATCH** `/records/:id` - Used to update aspects of your records, name, value and ttl mostly

### **DELETE** `/records/:id` - Deletes a record by its id if owned by you

import { createServer } from "node:http";
import {
    Client,
    GatewayIntentBits
} from "discord.js";

const TOKEN =
    process.env.DISCORD_BOT_TOKEN;

const GATEWAY_SECRET =
    process.env.GATEWAY_SHARED_SECRET;

const WORKER_URL =
    "https://eve-mentor.mmyprofitland.workers.dev";


if (!TOKEN) {
    throw new Error(
        "Falta DISCORD_BOT_TOKEN"
    );
}


if (!GATEWAY_SECRET) {
    throw new Error(
        "Falta GATEWAY_SHARED_SECRET"
    );
}


const client =
    new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    });


client.once(
    "ready",
    () => {
        console.log(
            `EVE Mentor Gateway conectado como ${client.user.tag}`
        );
    }
);


client.on(
    "messageCreate",
    async (message) => {
        try {

            if (message.author.bot) {
                return;
            }


            if (!message.guild) {
                return;
            }


            if (
                !message.channel?.name?.startsWith(
                    "eve-mentor-ticket-"
                )
            ) {
                return;
            }


            const content =
                message.content.trim();


            if (!content) {
                return;
            }


            console.log(
                `[TICKET] ${message.author.username}: ${content}`
            );


            const response =
                await fetch(
                    `${WORKER_URL}/discord/message`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "x-gateway-secret":
                                GATEWAY_SECRET
                        },

                        body:
                            JSON.stringify({
                                guild_id:
                                    message.guild.id,

                                channel_id:
                                    message.channel.id,

                                user_id:
                                    message.author.id,

                                content
                            })
                    }
                );


            const result =
                await response.text();


            if (!response.ok) {
                console.error(
                    `Worker ${response.status}:`,
                    result
                );

                return;
            }


            console.log(
                "Worker OK:",
                result
            );

        } catch (error) {

            console.error(
                "Error procesando mensaje:",
                error
            );
        }
    }
);


client.login(
    TOKEN
);


const PORT = Number(process.env.PORT || 10000);

const server = createServer((req, res) => {
    res.writeHead(200, {
        "Content-Type": "text/plain; charset=UTF-8"
    });

    res.end("EVE Mentor Gateway online");
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`HTTP server listening on port ${PORT}`);
});


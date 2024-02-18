import { ActorCommandSelector, CommandPermissionLevel } from "bdsx/bds/command";
import { command } from "bdsx/command";
import { CxxString } from "bdsx/nativetype";
import { Slapper } from "./main";
import { Player } from "bdsx/bds/player";
import { send } from "./messages";

command.register('slapper', 'Crate Slappers!', CommandPermissionLevel.Operator).overload((param, origin, _out) => {
    let player = origin.getEntity() as Player
    const actors = param.actor.newResults(origin)
    actors.forEach(actor => {
        if (actor?.isPlayer()) return;
        Slapper.create(actor, param.command, param?.message).then(() => {
            send.success(`Created slapper: ${actor.getIdentifier()}`, player)
        }).catch(() => {
            send.error(`An error ocurred while trying to create slapper: ${actor.getIdentifier()}`, player)
        })
    })
}, {
    option: command.enum('slapper.create', 'create'),
    actor: ActorCommandSelector,
    command: CxxString,
    message: [CxxString, true]
}).overload((param, origin, _out) => {
    let player = origin.getEntity() as Player
    const actors = param.actor.newResults(origin)
    actors.forEach(actor => {
        Slapper.remove(actor).then(() => {
            send.success(`Removed slapper: ${actor.getIdentifier()}`, player)
        }).catch(() => {
            send.error(`An error ocurred while trying to remove slapper: ${actor.getIdentifier()}`, player)
        })
    })
}, {
    option: command.enum('slapper.remove', 'remove'),
    actor: ActorCommandSelector
})
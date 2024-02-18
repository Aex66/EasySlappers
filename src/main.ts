import { Actor, ActorFlags } from "bdsx/bds/actor";
import { resolve } from "path";
import * as fs from 'fs'
import { events } from "bdsx/event";
import { Player } from "bdsx/bds/player";
import { CANCEL, returnFalse } from "bdsx/common";
import { bedrockServer } from "bdsx/launcher";
import { CommandPermissionLevel } from "bdsx/bds/command";
const filePath = resolve(__dirname, '../Slappers.json')

interface SlapperInformation {
    command: string;
    createdAt: string
    slapperID: string;
    message?: string;
}

export let Slappers: { [id: string]: SlapperInformation } = {

}

try { Slappers = require(filePath) } catch {}

export namespace Slapper {
    export function create(actor: Actor, command: string, message?: string) {
        return new Promise((re, rj) => {
            const slapperID = randomNumber().toString()
            if (isSlapper(actor)) return rj(`The actor ${actor.getIdentifier()} is already a slapper`)

            actor.setStatusFlag(ActorFlags.NoAI, true)
            actor.addTag('isSlapper')
            actor.addTag(`SlapperID:${slapperID}`)
            Object.assign(Slappers, { [slapperID]: {
                slapperID,
                command,
                createdAt: new Date().toDateString(),
                message
            }})
            re(true)
        })
    }

    export function remove(actor: Actor) {
        return new Promise((re, rj) => {
            if (!isSlapper(actor)) return rj(`This actor is not a slapper`)

            const slapperID = actor.getTags().find(tag => tag.startsWith('SlapperID:'))?.split(':')[1]
            if (!slapperID) return;

            if (!isSlapper(actor)) return rj(`This actor is not a slapper`)

            actor.removeTag('isSlapper')
            actor.removeTag(`SlapperID:${slapperID}`)
            actor.setStatusFlag(ActorFlags.NoAI, false)
            delete Slappers[slapperID]
            return re(slapperID)
        })
    }

    export function isSlapper(actor: Actor) {
        const slapperID = actor.getTags().find(tag => tag.startsWith('SlapperID:'))?.split(':')[1]
        if (slapperID && slapperID in Slappers) return true
        return false
    }

    export function hit(player: Player, slapper: Actor) {
        return new Promise((re, rj) => {
            if (!isSlapper(slapper)) return rj()

            const slapperID = slapper.getTags().find(tag => tag.startsWith('SlapperID:'))?.split(':')[1]!
            const info = Slappers[slapperID]

            player.runCommand(info.command)

            if (info?.message) player.sendMessage(info.message)
        })
    }

    export function save() {
        fs.writeFile(filePath, JSON.stringify(Slappers, null, 2), "utf8", (err) => {
            if (err) {
                console.log(`PlayerPerms.json ${err}`.red);
                throw err;
            }
            else console.log(`PlayerPerms.json Saved!`.green);
        });
    }
}

events.entityHurt.on((event) => {
    if (Slapper.isSlapper(event.entity)) return CANCEL
})

events.playerAttack.on((event) => {
    const { player, victim } = event

    if (!Slapper.isSlapper(victim)) return;
    Slapper.hit(player, victim)
})

events.serverClose.on(() => {
    Slapper.save()
})

events.playerInteract.on((ev) => {

    const player = ev.player

    if (!Slapper.isSlapper(ev.victim)) return;
    if (ev.player.getCommandPermissionLevel() !== CommandPermissionLevel.Operator) return;
    if (!ev.player.isSneaking()) return;

    Slapper.remove(ev.victim).then((slapperID) => {
        player.sendMessage(`§aRemoved slapper with the ID ${slapperID}`)
    }).catch(() => {})
})

events.entityCreated.on(ev => {
    if (!ev.entity.hasTag('isSlapper')) return;
    ev.entity.setStatusFlag(ActorFlags.NoAI, true)
})
//Random 9 digits number
function randomNumber(): number {
    const min = 100000000;
    const max = 999999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
import { events } from "bdsx/event";
events.serverOpen.on(()=>{
    console.log('[plugin:EasySlappers] Started'.green);
    import('./src/main')
    import('./src/command')
});

events.serverClose.on(()=>{
    console.log('[plugin:EasySlappers] Closed'.red);
});


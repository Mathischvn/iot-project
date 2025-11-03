export default function Thermostat() {
    return (
        <>
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <div className="bg-muted/50 aspect-square rounded-xl" />
                <div className="bg-muted/50 aspect-square rounded-xl" />
                <div className="bg-muted/50 aspect-square rounded-xl" />
            </div>
            <div className="bg-muted/50 min-h-[40vh] flex-1 rounded-xl md:min-h-min" />
        </>
    )
}

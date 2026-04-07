import { CheckCircle2, Clock, XCircle } from "lucide-react";

function StatusDot({ status }: { status: string }) {
    if (status === "completed")
        return <CheckCircle2 size={11} className="text-emerald-500 dark:text-emerald-400 shrink-0" />;
    if (status === "failed")
        return <XCircle size={11} className="text-rose-500 dark:text-rose-400 shrink-0" />;
    return <Clock size={11} className="text-amber-500 dark:text-amber-400 shrink-0" />;
}

export default StatusDot
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { prettifyApiError } from "@/lib/notify";

import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";

type DeleteApplicationDialogProps = {
    appId: string | number;
    onDeleted?: (appId: string | number) => void;
};

export default function DeleteApplicationDialog({ appId, onDeleted }: DeleteApplicationDialogProps) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);

    async function onDelete() {
        try {
            setDeleting(true);
            await api.deleteApplication(appId);

            toast.success("Application deleted successfully");
            onDeleted?.(appId);
            router.refresh();
        } catch (e) {
            toast.error(prettifyApiError(e));
        } finally {
            setDeleting(false);
        }
    }


    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    Delete
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete this application?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} disabled={deleting}>
                        {deleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

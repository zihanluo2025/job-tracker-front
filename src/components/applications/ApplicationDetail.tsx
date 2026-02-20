"use client";

import { useState } from "react";
import { Application } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ApplicationJdTab from "./ApplicationJdTab";

export default function ApplicationDetail({ initial }: { initial: Application }) {
    const [app, setApp] = useState<Application>(initial);

    return (
        <div className="space-y-4">
            <div>
                <div className="text-2xl font-semibold">{app.role}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>{app.company}</span>
                    <Badge variant="secondary">{app.status}</Badge>
                </div>
            </div>

            <Card className="p-4">
                <Tabs defaultValue="overview">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="jd">JD</TabsTrigger>
                        <TabsTrigger value="interviews" disabled>Interviews</TabsTrigger>
                        <TabsTrigger value="tasks" disabled>Tasks</TabsTrigger>
                        <TabsTrigger value="notes" disabled>Notes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="pt-4">
                        <div className="text-sm text-muted-foreground">
                            这里先放基础信息（来源、链接、投递时间等），后面我再补全表单编辑。
                        </div>
                    </TabsContent>

                    <TabsContent value="jd" className="pt-4">
                        <ApplicationJdTab app={app} onUpdated={setApp} />
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    );
}

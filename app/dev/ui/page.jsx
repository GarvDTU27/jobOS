"use client"

import React from "react"
import { Button } from "../../../components/ui/Button"
import { Input } from "../../../components/ui/Input"
import { Select } from "../../../components/ui/Select"
import { Badge } from "../../../components/ui/Badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../../components/ui/Card"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "../../../components/ui/Dialog"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "../../../components/ui/Table"
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastAction } from "../../../components/ui/Toast"

export default function UIDevPage() {
  const [toastOpen, setToastOpen] = React.useState(false)

  return (
    <div className="p-8 space-y-12 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-4">UI Primitives</h1>
        <p className="text-gray-500">Temporary page to verify UI components.</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Button</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Input & Select</h2>
        <div className="flex gap-4 max-w-md">
          <Input placeholder="Email address" type="email" />
          <Select>
            <option value="1">Option 1</option>
            <option value="2">Option 2</option>
          </Select>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Badge</h2>
        <div className="flex gap-4">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Card</h2>
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Job Application</CardTitle>
            <CardDescription>Software Engineer at Acme Corp</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Applied on Oct 12, 2023. Currently in interview stage.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full">View Details</Button>
          </CardFooter>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Dialog</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Application</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this application? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input placeholder="Type DELETE to confirm" />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <Button variant="destructive">Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Table</h2>
        <Table>
          <TableCaption>A list of your recent applications.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Match</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Acme Corp</TableCell>
              <TableCell>Software Engineer</TableCell>
              <TableCell><Badge variant="outline">Applied</Badge></TableCell>
              <TableCell className="text-right">85%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Globex</TableCell>
              <TableCell>Frontend Developer</TableCell>
              <TableCell><Badge variant="success">Interview</Badge></TableCell>
              <TableCell className="text-right">92%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Toast</h2>
        <ToastProvider>
          <Button onClick={() => setToastOpen(true)}>Show Toast</Button>
          <Toast open={toastOpen} onOpenChange={setToastOpen}>
            <div className="grid gap-1">
              <ToastTitle>Application saved</ToastTitle>
              <ToastDescription>Friday, February 10, 2023 at 5:57 PM</ToastDescription>
            </div>
            <ToastAction altText="Undo" asChild>
              <Button variant="outline" size="sm">Undo</Button>
            </ToastAction>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      </section>
    </div>
  )
}

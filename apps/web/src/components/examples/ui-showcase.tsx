import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormMessage } from '@/components/ui/form';

export function UIShowcase() {
  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">UI Component Showcase</h2>
        <p className="text-muted-foreground">
          Demonstrating Shadcn/ui components with our theme
        </p>
      </div>

      <Form className="space-y-4">
        <FormField>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="Enter your email" />
          <FormMessage>This is a helper message</FormMessage>
        </FormField>

        <FormField>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" type="text" placeholder="Enter your full name" />
        </FormField>

        <div className="flex gap-2">
          <Button variant="default">Primary Button</Button>
          <Button variant="secondary">Secondary</Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </Form>

      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">Theme Colors</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="p-2 bg-primary text-primary-foreground rounded">
            Primary
          </div>
          <div className="p-2 bg-secondary text-secondary-foreground rounded">
            Secondary
          </div>
          <div className="p-2 bg-muted text-muted-foreground rounded">
            Muted
          </div>
          <div className="p-2 bg-accent text-accent-foreground rounded">
            Accent
          </div>
        </div>
      </div>
    </div>
  );
}

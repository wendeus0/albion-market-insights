import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Bell,
  Plus,
  ToggleLeft,
  ToggleRight,
  Trash2,
  ArrowDown,
  ArrowUp,
  Percent,
  Mail,
  BellRing,
} from 'lucide-react';
import type { Alert, MarketItem } from '@/data/types';
import { cities } from '@/data/constants';
import { alertFormSchema, type AlertFormValues } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface AlertsManagerProps {
  availableItems: MarketItem[];
  alerts: Alert[];
  onSaveAlert: (alert: Alert) => void;
  onDeleteAlert: (id: string) => void;
}

export function AlertsManager({ availableItems, alerts, onSaveAlert, onDeleteAlert }: AlertsManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<AlertFormValues>({
    resolver: zodResolver(alertFormSchema),
    defaultValues: {
      itemId: '',
      city: 'all',
      condition: 'below',
      threshold: undefined,
      notifications: { inApp: true, email: false },
    },
  });

  const alertType = form.watch('condition');

  const toggleAlert = (alert: Alert) => {
    onSaveAlert({ ...alert, isActive: !alert.isActive });
    toast.success('Alert updated', {
      description: 'Your alert status has been changed.',
    });
  };

  const deleteAlert = (id: string) => {
    onDeleteAlert(id);
    toast.success('Alert deleted', {
      description: 'Your price alert has been removed.',
    });
  };

  const onSubmit = (values: AlertFormValues) => {
    const item = availableItems.find(i => i.itemId === values.itemId);
    const newAlert: Alert = {
      id: Date.now().toString(),
      itemId: values.itemId,
      itemName: item?.itemName || 'Unknown Item',
      city: values.city, // Valor canônico: 'all' ou nome da cidade
      condition: values.condition,
      threshold: values.threshold,
      isActive: true,
      createdAt: new Date().toISOString(),
      notifications: values.notifications,
    };

    onSaveAlert(newAlert);
    setIsDialogOpen(false);
    form.reset();

    toast.success('Alert created!', {
      description: `You'll be notified when ${item?.itemName} price ${
        values.condition === 'below' ? 'drops below' :
        values.condition === 'above' ? 'goes above' : 'changes by'
      } ${values.threshold}${values.condition === 'change' ? '%' : ''}.`,
    });
  };

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'below': return <ArrowDown className="h-4 w-4 text-success" />;
      case 'above': return <ArrowUp className="h-4 w-4 text-destructive" />;
      case 'change': return <Percent className="h-4 w-4 text-primary" />;
      default: return null;
    }
  };

  const getConditionText = (alert: Alert) => {
    switch (alert.condition) {
      case 'below': return `Price below ${alert.threshold.toLocaleString()}`;
      case 'above': return `Price above ${alert.threshold.toLocaleString()}`;
      case 'change': return `Price change ≥ ${alert.threshold}%`;
    }
  };

  const getCityLabel = (city: string) => {
    return city === 'all' ? 'All Cities' : city;
  };

  const uniqueItems = Array.from(
    new Map(availableItems.map(item => [item.itemName, item])).values()
  ).slice(0, 20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-foreground">Price Alerts</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Get notified when prices match your criteria
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) form.reset();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gold-gradient text-primary-foreground hover:opacity-90 gold-glow">
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display">Create Price Alert</DialogTitle>
              <DialogDescription>
                Set up a new alert to track price changes for your favorite items.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">

                {/* Item Selector */}
                <FormField
                  control={form.control}
                  name="itemId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="bg-muted/50 border-border">
                            <SelectValue placeholder="Select an item..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {uniqueItems.map(item => (
                            <SelectItem key={item.itemId} value={item.itemId}>
                              <span className="flex items-center gap-2">
                                <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                  {item.tier}
                                </span>
                                {item.itemName}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* City Selector */}
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="bg-muted/50 border-border">
                            <SelectValue placeholder="Select city..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All Cities</SelectItem>
                          {cities.map(city => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Alert Type */}
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alert Type</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            type="button"
                            variant={field.value === 'below' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => field.onChange('below')}
                            className={cn(field.value === 'below' && 'bg-success text-success-foreground')}
                          >
                            <ArrowDown className="h-3 w-3 mr-1" />
                            Below
                          </Button>
                          <Button
                            type="button"
                            variant={field.value === 'above' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => field.onChange('above')}
                            className={cn(field.value === 'above' && 'bg-destructive text-destructive-foreground')}
                          >
                            <ArrowUp className="h-3 w-3 mr-1" />
                            Above
                          </Button>
                          <Button
                            type="button"
                            variant={field.value === 'change' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => field.onChange('change')}
                            className={cn(field.value === 'change' && 'bg-primary text-primary-foreground')}
                          >
                            <Percent className="h-3 w-3 mr-1" />
                            Change
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Threshold */}
                <FormField
                  control={form.control}
                  name="threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {alertType === 'change' ? 'Percentage Change' : 'Price Threshold'}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder={alertType === 'change' ? 'e.g., 15' : 'e.g., 50000'}
                            value={field.value ?? ''}
                            onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                            className="bg-muted/50 border-border pr-8"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            {alertType === 'change' ? '%' : ''}
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Notifications */}
                <div className="space-y-3">
                  <FormLabel>Notifications</FormLabel>
                  <Controller
                    control={form.control}
                    name="notifications.inApp"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="inApp"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <label htmlFor="inApp" className="text-sm flex items-center gap-2 cursor-pointer">
                          <BellRing className="h-4 w-4 text-muted-foreground" />
                          In-app notification
                        </label>
                      </div>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="notifications.email"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="email"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <label htmlFor="email" className="text-sm flex items-center gap-2 cursor-pointer">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          Email notification
                        </label>
                      </div>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gold-gradient text-primary-foreground">
                    Create Alert
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Box */}
      <div className="glass-card p-4 border-l-4 border-l-primary">
        <h4 className="font-medium text-foreground mb-1">How Alerts Work</h4>
        <p className="text-sm text-muted-foreground">
          We check market prices every 15 minutes. When a price matches your alert criteria,
          you'll receive a notification through your selected channels. Alerts can be paused
          or deleted at any time.
        </p>
      </div>

      {/* Alerts List */}
      <div className="glass-card overflow-hidden">
        {alerts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-1">No alerts yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first price alert to start tracking items.
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gold-gradient text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'flex items-center gap-4 p-4 transition-colors',
                  alert.isActive ? 'hover:bg-muted/30' : 'opacity-50 bg-muted/20'
                )}
              >
                {/* Icon */}
                <div className={cn(
                  'h-10 w-10 rounded-lg flex items-center justify-center',
                  alert.isActive ? 'bg-primary/10' : 'bg-muted'
                )}>
                  {getConditionIcon(alert.condition)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground">{alert.itemName}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {getCityLabel(alert.city)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {getConditionText(alert)}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    {alert.notifications.inApp && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <BellRing className="h-3 w-3" /> In-app
                      </span>
                    )}
                    {alert.notifications.email && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" /> Email
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleAlert(alert)}
                    className="h-8 w-8"
                  >
                    {alert.isActive ? (
                      <ToggleRight className="h-5 w-5 text-success" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteAlert(alert.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

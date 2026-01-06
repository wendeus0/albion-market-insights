import { useState } from 'react';
import { 
  Bell, 
  Plus, 
  ToggleLeft, 
  ToggleRight, 
  Trash2, 
  Search,
  ArrowDown,
  ArrowUp,
  Percent,
  Mail,
  BellRing
} from 'lucide-react';
import { Alert, cities, mockItems } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AlertsManagerProps {
  initialAlerts: Alert[];
}

export function AlertsManager({ initialAlerts }: AlertsManagerProps) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [alertType, setAlertType] = useState<'below' | 'above' | 'change'>('below');
  const [threshold, setThreshold] = useState('');
  const [inAppNotification, setInAppNotification] = useState(true);
  const [emailNotification, setEmailNotification] = useState(false);
  const { toast } = useToast();

  const toggleAlert = (id: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
      )
    );
    toast({
      title: "Alert updated",
      description: "Your alert status has been changed.",
    });
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
    toast({
      title: "Alert deleted",
      description: "Your price alert has been removed.",
      variant: "destructive",
    });
  };

  const createAlert = () => {
    if (!selectedItem || !threshold) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const item = mockItems.find(i => i.itemId === selectedItem);
    const newAlert: Alert = {
      id: Date.now().toString(),
      itemId: selectedItem,
      itemName: item?.itemName || 'Unknown Item',
      city: selectedCity === 'all' ? 'All Cities' : selectedCity,
      condition: alertType,
      threshold: parseFloat(threshold),
      isActive: true,
      createdAt: new Date().toISOString(),
      notifications: {
        inApp: inAppNotification,
        email: emailNotification,
      },
    };

    setAlerts(prev => [newAlert, ...prev]);
    setIsDialogOpen(false);
    resetForm();

    toast({
      title: "Alert created!",
      description: `You'll be notified when ${item?.itemName} price ${alertType === 'below' ? 'drops below' : alertType === 'above' ? 'goes above' : 'changes by'} ${threshold}${alertType === 'change' ? '%' : ''}.`,
    });
  };

  const resetForm = () => {
    setSelectedItem('');
    setSelectedCity('all');
    setAlertType('below');
    setThreshold('');
    setInAppNotification(true);
    setEmailNotification(false);
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

  const uniqueItems = Array.from(
    new Map(mockItems.map(item => [item.itemName, item])).values()
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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

            <div className="space-y-4 py-4">
              {/* Item Selector */}
              <div className="space-y-2">
                <Label htmlFor="item">Item</Label>
                <Select value={selectedItem} onValueChange={setSelectedItem}>
                  <SelectTrigger className="bg-muted/50 border-border">
                    <SelectValue placeholder="Select an item..." />
                  </SelectTrigger>
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
              </div>

              {/* City Selector */}
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="bg-muted/50 border-border">
                    <SelectValue placeholder="Select city..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Alert Type */}
              <div className="space-y-2">
                <Label>Alert Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={alertType === 'below' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAlertType('below')}
                    className={cn(
                      alertType === 'below' && 'bg-success text-success-foreground'
                    )}
                  >
                    <ArrowDown className="h-3 w-3 mr-1" />
                    Below
                  </Button>
                  <Button
                    type="button"
                    variant={alertType === 'above' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAlertType('above')}
                    className={cn(
                      alertType === 'above' && 'bg-destructive text-destructive-foreground'
                    )}
                  >
                    <ArrowUp className="h-3 w-3 mr-1" />
                    Above
                  </Button>
                  <Button
                    type="button"
                    variant={alertType === 'change' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAlertType('change')}
                    className={cn(
                      alertType === 'change' && 'bg-primary text-primary-foreground'
                    )}
                  >
                    <Percent className="h-3 w-3 mr-1" />
                    Change
                  </Button>
                </div>
              </div>

              {/* Threshold */}
              <div className="space-y-2">
                <Label htmlFor="threshold">
                  {alertType === 'change' ? 'Percentage Change' : 'Price Threshold'}
                </Label>
                <div className="relative">
                  <Input
                    id="threshold"
                    type="number"
                    placeholder={alertType === 'change' ? 'e.g., 15' : 'e.g., 50000'}
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="bg-muted/50 border-border pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    {alertType === 'change' ? '%' : ''}
                  </span>
                </div>
              </div>

              {/* Notifications */}
              <div className="space-y-3">
                <Label>Notifications</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inApp"
                    checked={inAppNotification}
                    onCheckedChange={(checked) => setInAppNotification(checked as boolean)}
                  />
                  <label htmlFor="inApp" className="text-sm flex items-center gap-2 cursor-pointer">
                    <BellRing className="h-4 w-4 text-muted-foreground" />
                    In-app notification
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email"
                    checked={emailNotification}
                    onCheckedChange={(checked) => setEmailNotification(checked as boolean)}
                  />
                  <label htmlFor="email" className="text-sm flex items-center gap-2 cursor-pointer">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email notification
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createAlert} className="bg-gold-gradient text-primary-foreground">
                Create Alert
              </Button>
            </DialogFooter>
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
                      {alert.city}
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
                    onClick={() => toggleAlert(alert.id)}
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

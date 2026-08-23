import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/subscription_provider.dart';
import '../../theme/app_theme.dart';

class SubscriptionScreen extends StatefulWidget {
  const SubscriptionScreen({super.key});

  @override
  State<SubscriptionScreen> createState() => _SubscriptionScreenState();
}

class _SubscriptionScreenState extends State<SubscriptionScreen> {
  int? _selectedPackageId;

  @override
  void initState() {
    super.initState();
    Provider.of<SubscriptionProvider>(context, listen: false).loadPackages();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Premium Plans')),
      body: Consumer<SubscriptionProvider>(
        builder: (_, subProvider, __) {
          if (subProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                // Header
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: AppColors.primaryGradient,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Column(
                    children: [
                      Icon(Icons.workspace_premium, size: 48, color: Colors.white),
                      SizedBox(height: 12),
                      Text('Upgrade to Premium', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                      SizedBox(height: 6),
                      Text('Unlock all features & find your match faster',
                          style: TextStyle(color: Colors.white70, fontSize: 14), textAlign: TextAlign.center),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Packages
                ...subProvider.packages.map((pkg) => _buildPackageCard(pkg)),

                const SizedBox(height: 24),

                // Purchase Button
                if (_selectedPackageId != null)
                  SizedBox(
                    width: double.infinity,
                    height: 54,
                    child: ElevatedButton(
                      onPressed: _initPayment,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: const Text('Proceed to Pay', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    ),
                  ),

                const SizedBox(height: 16),

                // Secure payment note
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.lock_outlined, size: 14, color: Colors.grey.shade500),
                    const SizedBox(width: 6),
                    Text('Secure payment via Razorpay', style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildPackageCard(Map<String, dynamic> pkg) {
    final isSelected = _selectedPackageId == pkg['id'];
    final isPopular = pkg['is_popular'] == true;

    return GestureDetector(
      onTap: () => setState(() => _selectedPackageId = pkg['id']),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withOpacity(0.05) : Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: isSelected ? AppColors.primary : Colors.grey.shade200,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [BoxShadow(color: AppColors.primary.withOpacity(0.1), blurRadius: 15, offset: const Offset(0, 5))]
              : [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8)],
        ),
        child: Column(
          children: [
            Row(
              children: [
                // Package icon
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    gradient: isPopular ? AppColors.goldGradient : LinearGradient(colors: [Colors.grey.shade100, Colors.grey.shade200]),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(
                    isPopular ? Icons.crown_rounded : Icons.star_rounded,
                    color: isPopular ? Colors.white : Colors.grey,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(pkg['name'], style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          if (isPopular) ...[
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(color: AppColors.gold, borderRadius: BorderRadius.circular(8)),
                              child: const Text('POPULAR', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ],
                      ),
                      Text('${pkg['duration_days']} days', style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('₹${pkg['effective_price']?.toStringAsFixed(0)}',
                        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.primary)),
                    if (pkg['discount_percentage'] != null && pkg['discount_percentage'] > 0)
                      Row(
                        children: [
                          Text('₹${pkg['price']?.toStringAsFixed(0)}',
                              style: TextStyle(fontSize: 13, color: Colors.grey.shade500, decoration: TextDecoration.lineThrough)),
                          const SizedBox(width: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                            decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(4)),
                            child: Text('${pkg['discount_percentage']}% OFF',
                                style: TextStyle(fontSize: 10, color: Colors.green.shade700, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                  ],
                ),
              ],
            ),
            if (isSelected && pkg['features'] != null) ...[
              const SizedBox(height: 16),
              const Divider(),
              const SizedBox(height: 12),
              ...((pkg['features'] as List).map((f) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      children: [
                        const Icon(Icons.check_circle, color: AppColors.green, size: 18),
                        const SizedBox(width: 10),
                        Text(f.toString(), style: const TextStyle(fontSize: 13)),
                      ],
                    ),
                  ))),
            ],
          ],
        ),
      ),
    );
  }

  void _initPayment() async {
    if (_selectedPackageId == null) return;

    final subProvider = Provider.of<SubscriptionProvider>(context, listen: false);
    final orderData = await subProvider.createRazorpayOrder(_selectedPackageId!);

    if (orderData != null) {
      // Initialize Razorpay
      // This would use razorpay_flutter package to open the payment sheet
      _openRazorpayCheckout(orderData);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to create payment order. Please try again.')),
      );
    }
  }

  void _openRazorpayCheckout(Map<String, dynamic> orderData) {
    // Razorpay integration would go here
    // var options = {
    //   'key': orderData['key_id'],
    //   'amount': orderData['amount'],
    //   'name': 'Advaita Matrimony',
    //   'order_id': orderData['order_id'],
    //   'prefill': {
    //     'contact': orderData['user_phone'],
    //     'email': orderData['user_email'],
    //   },
    //   'theme': {'color': '#1E40AF'},
    // };
    // _razorpay.open(options);
  }
}

import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../widgets/journey_line.dart';

class MatchesScreen extends StatefulWidget {
  const MatchesScreen({super.key});

  @override
  State<MatchesScreen> createState() => _MatchesScreenState();
}

class _MatchesScreenState extends State<MatchesScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Matches'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          labelColor: AppColors.primary,
          unselectedLabelColor: Colors.grey,
          indicatorColor: AppColors.primary,
          tabs: const [
            Tab(text: 'Received'),
            Tab(text: 'Sent'),
            Tab(text: 'Mutual'),
            Tab(text: 'Shortlisted'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildEmptyState('No interests received yet', 'Complete your profile to attract more matches', Icons.inbox),
          _buildEmptyState('No interests sent', 'Start sending interests to profiles you like', Icons.send),
          _buildEmptyState('No mutual matches', 'When both sides accept, magic happens! ❤️', Icons.favorite),
          _buildEmptyState('Shortlist is empty', 'Bookmark profiles you want to review later', Icons.bookmark),
        ],
      ),
    );
  }

  Widget _buildEmptyState(String title, String subtitle, IconData icon) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Padding(padding: EdgeInsets.symmetric(horizontal: 28), child: JourneyLine(height: 56, animate: true)),
          Icon(icon, size: 80, color: Colors.grey.shade300),
          const SizedBox(height: 20),
          Text(title, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 21)),
          const SizedBox(height: 8),
          Text(subtitle, style: TextStyle(color: Colors.grey.shade500), textAlign: TextAlign.center),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }
}

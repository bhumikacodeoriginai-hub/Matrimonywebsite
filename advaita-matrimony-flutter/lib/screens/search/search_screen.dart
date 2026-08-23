import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/match_provider.dart';
import '../../theme/app_theme.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  String? _selectedGender;
  String? _selectedCategory;
  String? _selectedState;
  String? _selectedReligion;
  RangeValues _ageRange = const RangeValues(18, 50);
  bool _withPhotoOnly = false;
  bool _recentlyActive = false;
  bool _showFilters = true;

  @override
  void initState() {
    super.initState();
    Provider.of<MatchProvider>(context, listen: false).loadFilterOptions();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Search Profiles'),
        actions: [
          IconButton(
            icon: Icon(_showFilters ? Icons.filter_alt : Icons.filter_alt_outlined),
            onPressed: () => setState(() => _showFilters = !_showFilters),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Filters
          if (_showFilters)
            Container(
              margin: const EdgeInsets.fromLTRB(16, 8, 16, 8),
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppColors.divider),
                boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.08), blurRadius: 24, offset: const Offset(0, 10))],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Gender & Category Row
                  Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: _selectedGender,
                          decoration: const InputDecoration(labelText: 'Looking for', isDense: true, contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10)),
                          items: const [
                            DropdownMenuItem(value: 'female', child: Text('Bride')),
                            DropdownMenuItem(value: 'male', child: Text('Groom')),
                          ],
                          onChanged: (v) => setState(() => _selectedGender = v),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: _selectedCategory,
                          decoration: const InputDecoration(labelText: 'Community', isDense: true, contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10)),
                          items: const [
                            DropdownMenuItem(value: 'general', child: Text('General')),
                            DropdownMenuItem(value: 'physically_challenged', child: Text('Divyangjan')),
                            DropdownMenuItem(value: 'hearing_speech_impaired', child: Text('Deaf/Mute')),
                            DropdownMenuItem(value: 'vitiligo_skin_condition', child: Text('Vitiligo')),
                          ],
                          onChanged: (v) => setState(() => _selectedCategory = v),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Age Range
                  Row(
                    children: [
                      const Text('Age: ', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                      Text('${_ageRange.start.round()} - ${_ageRange.end.round()} yrs',
                          style: const TextStyle(fontSize: 13, color: AppColors.primary, fontWeight: FontWeight.w600)),
                    ],
                  ),
                  RangeSlider(
                    values: _ageRange,
                    min: 18,
                    max: 65,
                    divisions: 47,
                    activeColor: AppColors.primary,
                    onChanged: (v) => setState(() => _ageRange = v),
                  ),

                  // Toggles
                  Row(
                    children: [
                      FilterChip(
                        label: const Text('With Photo', style: TextStyle(fontSize: 12)),
                        selected: _withPhotoOnly,
                        onSelected: (v) => setState(() => _withPhotoOnly = v),
                        selectedColor: AppColors.primary.withOpacity(0.2),
                      ),
                      const SizedBox(width: 8),
                      FilterChip(
                        label: const Text('Active Recently', style: TextStyle(fontSize: 12)),
                        selected: _recentlyActive,
                        onSelected: (v) => setState(() => _recentlyActive = v),
                        selectedColor: AppColors.primary.withOpacity(0.2),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Search Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _performSearch,
                      icon: const Icon(Icons.search, size: 20),
                      label: const Text('Search Profiles'),
                    ),
                  ),
                ],
              ),
            ),

          // Results
          Expanded(
            child: Consumer<MatchProvider>(
              builder: (_, matchProvider, __) {
                if (matchProvider.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (matchProvider.searchResults.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.search, size: 80, color: Colors.grey.shade300),
                        const SizedBox(height: 16),
                        Text('Use the filters above to search profiles',
                            style: TextStyle(color: Colors.grey.shade500, fontSize: 16)),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: matchProvider.searchResults.length,
                  itemBuilder: (context, index) {
                    final profile = matchProvider.searchResults[index];
                    return _SearchResultCard(profile: profile);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _performSearch() {
    final filters = <String, dynamic>{};
    if (_selectedGender != null) filters['gender'] = _selectedGender;
    if (_selectedCategory != null) filters['profile_category'] = _selectedCategory;
    if (_selectedState != null) filters['state'] = _selectedState;
    if (_selectedReligion != null) filters['religion'] = _selectedReligion;
    filters['min_age'] = _ageRange.start.round();
    filters['max_age'] = _ageRange.end.round();
    if (_withPhotoOnly) filters['with_photo'] = true;
    if (_recentlyActive) filters['recently_active'] = true;

    Provider.of<MatchProvider>(context, listen: false).search(filters);
    setState(() => _showFilters = false);
  }
}

class _SearchResultCard extends StatelessWidget {
  final Map<String, dynamic> profile;
  const _SearchResultCard({required this.profile});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: const BorderSide(color: AppColors.divider)),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Container(
              width: 70,
              height: 70,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(18),
                color: AppColors.goldLight.withOpacity(0.25),
              ),
              child: const Icon(Icons.person_outline_rounded, color: AppColors.primary, size: 32),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(profile['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                  const SizedBox(height: 3),
                  Text('${profile['age'] ?? ''} • ${profile['city'] ?? ''} • ${profile['category_display'] ?? ''}',
                      style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                  Text('${profile['highest_education'] ?? ''} • ${profile['occupation'] ?? ''}',
                      style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                ],
              ),
            ),
            Column(
              children: [
                IconButton(icon: const Icon(Icons.favorite_border, color: AppColors.rose, size: 22), onPressed: () {}),
                IconButton(icon: const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey), onPressed: () {}),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

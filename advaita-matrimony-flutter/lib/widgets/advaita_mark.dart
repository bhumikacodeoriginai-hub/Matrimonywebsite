import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Small, reusable brand primitive used by authenticated and public surfaces.
class AdvaitaMark extends StatelessWidget {
  final bool compact;
  final bool onDark;

  const AdvaitaMark({super.key, this.compact = false, this.onDark = false});

  @override
  Widget build(BuildContext context) {
    final titleColor = onDark ? AppColors.background : AppColors.textPrimary;
    final subtitleColor = onDark ? AppColors.goldLight : AppColors.textSecondary;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: compact ? 34 : 42,
          height: compact ? 34 : 42,
          decoration: BoxDecoration(
            gradient: AppColors.primaryGradient,
            borderRadius: BorderRadius.circular(compact ? 10 : 12),
            border: Border.all(color: AppColors.goldLight.withOpacity(.45)),
          ),
          alignment: Alignment.center,
          child: Text('A', style: Theme.of(context).textTheme.titleLarge?.copyWith(color: AppColors.goldLight, fontWeight: FontWeight.w700, fontStyle: FontStyle.italic)),
        ),
        if (!compact) ...[
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Advaita', style: Theme.of(context).textTheme.titleLarge?.copyWith(color: titleColor, fontSize: 22, height: 1)),
              Text('TWO JOURNEYS · ONE BEGINNING', style: TextStyle(color: subtitleColor, fontSize: 7, letterSpacing: 1.05, fontWeight: FontWeight.w700)),
            ],
          ),
        ],
      ],
    );
  }
}

class EditorialEyebrow extends StatelessWidget {
  final String label;
  final Color? color;

  const EditorialEyebrow(this.label, {super.key, this.color});

  @override
  Widget build(BuildContext context) => Text(
        label.toUpperCase(),
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: color ?? AppColors.gold,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.5,
            ),
      );
}

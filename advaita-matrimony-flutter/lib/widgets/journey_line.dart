import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Advaita's signature visual: two independent paths that gently meet.
class JourneyLine extends StatefulWidget {
  final double height;
  final bool animate;
  final Color color;

  const JourneyLine({super.key, this.height = 120, this.animate = true, this.color = AppColors.goldLight});

  @override
  State<JourneyLine> createState() => _JourneyLineState();
}

class _JourneyLineState extends State<JourneyLine> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 1800));
    if (widget.animate) _controller.forward();
  }

  @override
  void didUpdateWidget(covariant JourneyLine oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.animate && !oldWidget.animate) _controller.forward();
    if (!widget.animate) _controller.value = 1;
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final reduceMotion = MediaQuery.maybeOf(context)?.disableAnimations ?? false;
    return SizedBox(
      height: widget.height,
      width: double.infinity,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (_, __) => CustomPaint(
          painter: _JourneyPainter(
            progress: reduceMotion || !widget.animate ? 1 : Curves.easeInOutCubic.transform(_controller.value),
            color: widget.color,
          ),
        ),
      ),
    );
  }
}

class _JourneyPainter extends CustomPainter {
  final double progress;
  final Color color;

  const _JourneyPainter({required this.progress, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final midY = size.height * .52;
    final left = Path()
      ..moveTo(0, midY - 24)
      ..cubicTo(size.width * .25, midY - 52, size.width * .3, midY + 42, size.width * .5, midY);
    final right = Path()
      ..moveTo(size.width, midY + 24)
      ..cubicTo(size.width * .75, midY + 52, size.width * .7, midY - 42, size.width * .5, midY);
    final paint = Paint()
      ..color = color.withOpacity(.78)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.4
      ..strokeCap = StrokeCap.round;
    _drawPartial(canvas, left, paint, progress);
    _drawPartial(canvas, right, paint, progress);

    final pulse = Paint()..color = color.withOpacity(.18 * progress);
    canvas.drawCircle(Offset(size.width * .5, midY), 16 + (math.sin(progress * math.pi) * 8), pulse);
    canvas.drawCircle(Offset(size.width * .5, midY), 3.5, Paint()..color = color);
  }

  void _drawPartial(Canvas canvas, Path path, Paint paint, double amount) {
    final metrics = path.computeMetrics().first;
    canvas.drawPath(metrics.extractPath(0, metrics.length * amount), paint);
  }

  @override
  bool shouldRepaint(covariant _JourneyPainter oldDelegate) => oldDelegate.progress != progress || oldDelegate.color != color;
}

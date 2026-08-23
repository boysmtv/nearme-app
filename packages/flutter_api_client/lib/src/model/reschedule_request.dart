//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'reschedule_request.g.dart';

/// RescheduleRequest
///
/// Properties:
/// * [newStartsAt] 
/// * [newEndsAt] 
/// * [expectedVersion] 
@BuiltValue()
abstract class RescheduleRequest implements Built<RescheduleRequest, RescheduleRequestBuilder> {
  @BuiltValueField(wireName: r'newStartsAt')
  DateTime get newStartsAt;

  @BuiltValueField(wireName: r'newEndsAt')
  DateTime get newEndsAt;

  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  RescheduleRequest._();

  factory RescheduleRequest([void updates(RescheduleRequestBuilder b)]) = _$RescheduleRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(RescheduleRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<RescheduleRequest> get serializer => _$RescheduleRequestSerializer();
}

class _$RescheduleRequestSerializer implements PrimitiveSerializer<RescheduleRequest> {
  @override
  final Iterable<Type> types = const [RescheduleRequest, _$RescheduleRequest];

  @override
  final String wireName = r'RescheduleRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    RescheduleRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'newStartsAt';
    yield serializers.serialize(
      object.newStartsAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'newEndsAt';
    yield serializers.serialize(
      object.newEndsAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'expectedVersion';
    yield serializers.serialize(
      object.expectedVersion,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    RescheduleRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required RescheduleRequestBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'newStartsAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.newStartsAt = valueDes;
          break;
        case r'newEndsAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.newEndsAt = valueDes;
          break;
        case r'expectedVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.expectedVersion = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  RescheduleRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = RescheduleRequestBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}


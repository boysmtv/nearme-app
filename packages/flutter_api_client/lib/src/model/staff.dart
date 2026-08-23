//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'staff.g.dart';

/// Staff
///
/// Properties:
/// * [id] 
/// * [tenantId] 
/// * [userId] 
/// * [displayName] 
/// * [email] 
/// * [phone] 
/// * [status] 
/// * [visibility] 
@BuiltValue()
abstract class Staff implements Built<Staff, StaffBuilder> {
  @BuiltValueField(wireName: r'id')
  String? get id;

  @BuiltValueField(wireName: r'tenantId')
  String? get tenantId;

  @BuiltValueField(wireName: r'userId')
  String? get userId;

  @BuiltValueField(wireName: r'displayName')
  String? get displayName;

  @BuiltValueField(wireName: r'email')
  String? get email;

  @BuiltValueField(wireName: r'phone')
  String? get phone;

  @BuiltValueField(wireName: r'status')
  StaffStatusEnum? get status;
  // enum statusEnum {  ACTIVE,  INACTIVE,  };

  @BuiltValueField(wireName: r'visibility')
  StaffVisibilityEnum? get visibility;
  // enum visibilityEnum {  PUBLIC,  HIDDEN,  };

  Staff._();

  factory Staff([void updates(StaffBuilder b)]) = _$Staff;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(StaffBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<Staff> get serializer => _$StaffSerializer();
}

class _$StaffSerializer implements PrimitiveSerializer<Staff> {
  @override
  final Iterable<Type> types = const [Staff, _$Staff];

  @override
  final String wireName = r'Staff';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    Staff object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.id != null) {
      yield r'id';
      yield serializers.serialize(
        object.id,
        specifiedType: const FullType(String),
      );
    }
    if (object.tenantId != null) {
      yield r'tenantId';
      yield serializers.serialize(
        object.tenantId,
        specifiedType: const FullType(String),
      );
    }
    if (object.userId != null) {
      yield r'userId';
      yield serializers.serialize(
        object.userId,
        specifiedType: const FullType(String),
      );
    }
    if (object.displayName != null) {
      yield r'displayName';
      yield serializers.serialize(
        object.displayName,
        specifiedType: const FullType(String),
      );
    }
    if (object.email != null) {
      yield r'email';
      yield serializers.serialize(
        object.email,
        specifiedType: const FullType(String),
      );
    }
    if (object.phone != null) {
      yield r'phone';
      yield serializers.serialize(
        object.phone,
        specifiedType: const FullType(String),
      );
    }
    if (object.status != null) {
      yield r'status';
      yield serializers.serialize(
        object.status,
        specifiedType: const FullType(StaffStatusEnum),
      );
    }
    if (object.visibility != null) {
      yield r'visibility';
      yield serializers.serialize(
        object.visibility,
        specifiedType: const FullType(StaffVisibilityEnum),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    Staff object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required StaffBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.id = valueDes;
          break;
        case r'tenantId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.tenantId = valueDes;
          break;
        case r'userId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.userId = valueDes;
          break;
        case r'displayName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.displayName = valueDes;
          break;
        case r'email':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.email = valueDes;
          break;
        case r'phone':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.phone = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(StaffStatusEnum),
          ) as StaffStatusEnum?;
          if (valueDes == null) continue;
          result.status = valueDes;
          break;
        case r'visibility':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(StaffVisibilityEnum),
          ) as StaffVisibilityEnum?;
          if (valueDes == null) continue;
          result.visibility = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  Staff deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = StaffBuilder();
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

class StaffStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const StaffStatusEnum ACTIVE = _$staffStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'INACTIVE')
  static const StaffStatusEnum INACTIVE = _$staffStatusEnum_INACTIVE;

  static Serializer<StaffStatusEnum> get serializer => _$staffStatusEnumSerializer;

  const StaffStatusEnum._(String name): super(name);

  static BuiltSet<StaffStatusEnum> get values => _$staffStatusEnumValues;
  static StaffStatusEnum valueOf(String name) => _$staffStatusEnumValueOf(name);
}

class StaffVisibilityEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PUBLIC')
  static const StaffVisibilityEnum PUBLIC = _$staffVisibilityEnum_PUBLIC;
  @BuiltValueEnumConst(wireName: r'HIDDEN')
  static const StaffVisibilityEnum HIDDEN = _$staffVisibilityEnum_HIDDEN;

  static Serializer<StaffVisibilityEnum> get serializer => _$staffVisibilityEnumSerializer;

  const StaffVisibilityEnum._(String name): super(name);

  static BuiltSet<StaffVisibilityEnum> get values => _$staffVisibilityEnumValues;
  static StaffVisibilityEnum valueOf(String name) => _$staffVisibilityEnumValueOf(name);
}


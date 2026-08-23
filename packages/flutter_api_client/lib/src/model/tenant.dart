//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'tenant.g.dart';

/// Tenant
///
/// Properties:
/// * [id] 
/// * [name] 
/// * [slug] 
/// * [category] 
/// * [contactEmail] 
/// * [contactPhone] 
/// * [status] 
@BuiltValue()
abstract class Tenant implements Built<Tenant, TenantBuilder> {
  @BuiltValueField(wireName: r'id')
  String? get id;

  @BuiltValueField(wireName: r'name')
  String? get name;

  @BuiltValueField(wireName: r'slug')
  String? get slug;

  @BuiltValueField(wireName: r'category')
  String? get category;

  @BuiltValueField(wireName: r'contactEmail')
  String? get contactEmail;

  @BuiltValueField(wireName: r'contactPhone')
  String? get contactPhone;

  @BuiltValueField(wireName: r'status')
  TenantStatusEnum? get status;
  // enum statusEnum {  DRAFT,  SUBMITTED,  UNDER_REVIEW,  APPROVED,  REJECTED,  SUSPENDED,  };

  Tenant._();

  factory Tenant([void updates(TenantBuilder b)]) = _$Tenant;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(TenantBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<Tenant> get serializer => _$TenantSerializer();
}

class _$TenantSerializer implements PrimitiveSerializer<Tenant> {
  @override
  final Iterable<Type> types = const [Tenant, _$Tenant];

  @override
  final String wireName = r'Tenant';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    Tenant object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.id != null) {
      yield r'id';
      yield serializers.serialize(
        object.id,
        specifiedType: const FullType(String),
      );
    }
    if (object.name != null) {
      yield r'name';
      yield serializers.serialize(
        object.name,
        specifiedType: const FullType(String),
      );
    }
    if (object.slug != null) {
      yield r'slug';
      yield serializers.serialize(
        object.slug,
        specifiedType: const FullType(String),
      );
    }
    if (object.category != null) {
      yield r'category';
      yield serializers.serialize(
        object.category,
        specifiedType: const FullType(String),
      );
    }
    if (object.contactEmail != null) {
      yield r'contactEmail';
      yield serializers.serialize(
        object.contactEmail,
        specifiedType: const FullType(String),
      );
    }
    if (object.contactPhone != null) {
      yield r'contactPhone';
      yield serializers.serialize(
        object.contactPhone,
        specifiedType: const FullType(String),
      );
    }
    if (object.status != null) {
      yield r'status';
      yield serializers.serialize(
        object.status,
        specifiedType: const FullType(TenantStatusEnum),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    Tenant object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required TenantBuilder result,
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
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.name = valueDes;
          break;
        case r'slug':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.slug = valueDes;
          break;
        case r'category':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.category = valueDes;
          break;
        case r'contactEmail':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.contactEmail = valueDes;
          break;
        case r'contactPhone':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.contactPhone = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(TenantStatusEnum),
          ) as TenantStatusEnum?;
          if (valueDes == null) continue;
          result.status = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  Tenant deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = TenantBuilder();
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

class TenantStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'DRAFT')
  static const TenantStatusEnum DRAFT = _$tenantStatusEnum_DRAFT;
  @BuiltValueEnumConst(wireName: r'SUBMITTED')
  static const TenantStatusEnum SUBMITTED = _$tenantStatusEnum_SUBMITTED;
  @BuiltValueEnumConst(wireName: r'UNDER_REVIEW')
  static const TenantStatusEnum UNDER_REVIEW = _$tenantStatusEnum_UNDER_REVIEW;
  @BuiltValueEnumConst(wireName: r'APPROVED')
  static const TenantStatusEnum APPROVED = _$tenantStatusEnum_APPROVED;
  @BuiltValueEnumConst(wireName: r'REJECTED')
  static const TenantStatusEnum REJECTED = _$tenantStatusEnum_REJECTED;
  @BuiltValueEnumConst(wireName: r'SUSPENDED')
  static const TenantStatusEnum SUSPENDED = _$tenantStatusEnum_SUSPENDED;

  static Serializer<TenantStatusEnum> get serializer => _$tenantStatusEnumSerializer;

  const TenantStatusEnum._(String name): super(name);

  static BuiltSet<TenantStatusEnum> get values => _$tenantStatusEnumValues;
  static TenantStatusEnum valueOf(String name) => _$tenantStatusEnumValueOf(name);
}


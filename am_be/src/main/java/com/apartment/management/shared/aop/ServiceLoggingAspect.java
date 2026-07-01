package com.apartment.management.shared.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class ServiceLoggingAspect {

    @Around("within(com.apartment.management..service..*)")
    public Object logServiceStartEnd(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();

        String className = signature.getDeclaringType().getSimpleName();
        String methodName = signature.getName();

        long startTime = System.currentTimeMillis();

        log.info("START {}.{}", className, methodName);

        try {
            Object result = joinPoint.proceed();

            long duration = System.currentTimeMillis() - startTime;
            log.info("END {}.{} - {}ms", className, methodName, duration);

            return result;
        } catch (Throwable error) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("ERROR {}.{} - {}ms - {}", className, methodName, duration, error.getMessage());
            throw error;
        }
    }
}
